/**
 * IBM Cloud Function for AI Task Orchestrator
 * Integrates with IBM watsonx AI models
 */

const { IamAuthenticator } = require('ibm-watson/auth');
const AssistantV2 = require('ibm-watson/assistant/v2');

// IBM watsonx credentials (would be set as environment variables)
const API_KEY = process.env.WATSONX_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;
const SERVICE_URL = process.env.SERVICE_URL || 'https://api.us-south.assistant.watson.cloud.ibm.com';

// Initialize watsonx assistant
const assistant = new AssistantV2({
    version: '2021-11-27',
    authenticator: new IamAuthenticator({
        apikey: API_KEY,
    }),
    serviceUrl: SERVICE_URL,
});

// Main handler for IBM Cloud Function
async function main(params) {
    console.log('Received parameters:', JSON.stringify(params, null, 2));
    
    try {
        validateParams(params);
        
        const { agent, task, complexity, plan, validation } = params;
        const sessionId = await createSession();
        
        let result;
        
        switch (agent) {
            case 'planner':
                result = await callPlanner(task, complexity, sessionId);
                break;
            case 'validator':
                result = await callValidator(task, plan, sessionId);
                break;
            case 'advisor':
                result = await callAdvisor(task, plan, validation, sessionId);
                break;
            case 'orchestrate':
                result = await orchestrateTask(task, complexity, sessionId);
                break;
            default:
                throw new Error(`Unknown agent: ${agent}`);
        }
        
        await deleteSession(sessionId);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: {
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
                agent: agent
            }
        };
        
    } catch (error) {
        console.error('Error in main handler:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            }
        };
    }
}

async function createSession() {
    try {
        const response = await assistant.createSession({
            assistantId: ASSISTANT_ID
        });
        
        return response.result.session_id;
    } catch (error) {
        console.error('Error creating session:', error);
        throw new Error('Failed to create watsonx session');
    }
}

async function deleteSession(sessionId) {
    try {
        await assistant.deleteSession({
            assistantId: ASSISTANT_ID,
            sessionId: sessionId
        });
    } catch (error) {
        console.warn('Error deleting session:', error);
        // Non-critical error, don't throw
    }
}

async function callPlanner(task, complexity, sessionId) {
    const prompt = `As an AI Task Planner, break down the following task into manageable steps:

TASK: ${task}
COMPLEXITY: ${complexity}

Please provide:
1. A step-by-step breakdown
2. Estimated duration for each step
3. Required resources for each step
4. Success criteria for each step

Format the response as a structured JSON array with steps containing:
- id (number)
- title (string)
- description (string)
- duration (string)
- resources (array of strings)`;

    const response = await sendMessage(prompt, sessionId);
    return parsePlannerResponse(response);
}

async function callValidator(task, plan, sessionId) {
    const planJson = JSON.stringify(plan, null, 2);
    const prompt = `As an AI Task Validator, validate the following task plan:

TASK: ${task}
PLAN: ${planJson}

Please validate:
1. Feasibility of each step
2. Resource requirements
3. Timeline realism
4. Risk factors
5. Success criteria

For each validation point, provide:
- Type (passed/warning/failed)
- Title
- Detailed message

Format as JSON array with validation objects containing:
- id (number)
- type (string)
- title (string)
- message (string)`;

    const response = await sendMessage(prompt, sessionId);
    return parseValidatorResponse(response);
}

async function callAdvisor(task, plan, validation, sessionId) {
    const planJson = JSON.stringify(plan, null, 2);
    const validationJson = JSON.stringify(validation, null, 2);
    
    const prompt = `As an AI Task Advisor, provide expert advice for the following task:

TASK: ${task}
PLAN: ${planJson}
VALIDATION: ${validationJson}

Based on this information, provide expert advice including:
1. Best practices
2. Potential improvements
3. Risk mitigation strategies
4. Resource optimization tips
5. Success enhancement recommendations

Format as JSON array with advice objects containing:
- id (number)
- type (string: strategy/technology/team/communication)
- title (string)
- content (string)`;

    const response = await sendMessage(prompt, sessionId);
    return parseAdvisorResponse(response);
}

async function orchestrateTask(task, complexity, sessionId) {
    // Full orchestration: planner -> validator -> advisor
    const plan = await callPlanner(task, complexity, sessionId);
    const validation = await callValidator(task, plan, sessionId);
    const advice = await callAdvisor(task, plan, validation, sessionId);
    
    return {
        plan,
        validation,
        advice,
        summary: {
            complexity,
            totalSteps: plan.length,
            validationsPassed: validation.filter(v => v.type === 'passed').length,
            validationsWarning: validation.filter(v => v.type === 'warning').length,
            adviceCount: advice.length,
            estimatedDuration: calculateDuration(plan),
            riskLevel: calculateRiskLevel(validation)
        }
    };
}

async function sendMessage(message, sessionId) {
    try {
        const response = await assistant.message({
            assistantId: ASSISTANT_ID,
            sessionId: sessionId,
            input: {
                message_type: 'text',
                text: message,
                options: {
                    return_context: true
                }
            }
        });
        
        return response.result.output.generic[0].text;
        
    } catch (error) {
        console.error('Error sending message to watsonx:', error);
        throw new Error('Failed to communicate with AI model');
    }
}

function parsePlannerResponse(response) {
    try {
        // Extract JSON from response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        // Fallback: create structured steps from text
        const lines = response.split('\n').filter(line => line.trim());
        const steps = [];
        let currentStep = null;
        
        for (const line of lines) {
            if (line.match(/^\d+\./) || line.toLowerCase().includes('step')) {
                if (currentStep) {
                    steps.push(currentStep);
                }
                currentStep = {
                    id: steps.length + 1,
                    title: line.replace(/^\d+\.\s*/, '').trim(),
                    description: '',
                    duration: '1-2 hours',
                    resources: ['Basic Resources']
                };
            } else if (currentStep && line.trim()) {
                if (!currentStep.description) {
                    currentStep.description = line.trim();
                } else {
                    currentStep.description += ' ' + line.trim();
                }
            }
        }
        
        if (currentStep) {
            steps.push(currentStep);
        }
        
        return steps.length > 0 ? steps : getDefaultPlan();
        
    } catch (error) {
        console.error('Error parsing planner response:', error);
        return getDefaultPlan();
    }
}

function parseValidatorResponse(response) {
    try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        return getDefaultValidations();
        
    } catch (error) {
        console.error('Error parsing validator response:', error);
        return getDefaultValidations();
    }
}

function parseAdvisorResponse(response) {
    try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        return getDefaultAdvice();
        
    } catch (error) {
        console.error('Error parsing advisor response:', error);
        return getDefaultAdvice();
    }
}

// Default responses for fallback
function getDefaultPlan() {
    return [
        {
            id: 1,
            title: "Task Analysis",
            description: "Analyze requirements and define scope",
            duration: "1-2 hours",
            resources: ["Requirements Document", "Analysis Tools"]
        },
        {
            id: 2,
            title: "Planning & Strategy",
            description: "Develop implementation strategy and plan",
            duration: "2-3 hours",
            resources: ["Planning Framework", "Strategy Template"]
        },
        {
            id: 3,
            title: "Execution",
            description: "Execute the plan with regular reviews",
            duration: "4-6 hours",
            resources: ["Project Management Tools", "Team Resources"]
        }
    ];
}

function getDefaultValidations() {
    return [
        {
            id: 1,
            type: "passed",
            title: "Basic Validation",
            message: "Task structure appears valid and achievable"
        },
        {
            id: 2,
            type: "warning",
            title: "Resource Check",
            message: "Review resource allocation for optimal efficiency"
        }
    ];
}

function getDefaultAdvice() {
    return [
        {
            id: 1,
            type: "strategy",
            title: "Recommended Approach",
            content: "Consider adopting an agile methodology for flexibility"
        },
        {
            id: 2,
            type: "communication",
            title: "Stakeholder Management",
            content: "Maintain regular communication with all stakeholders"
        }
    ];
}

function calculateDuration(plan) {
    const durations = plan.map(step => {
        const match = step.duration.match(/(\d+)-(\d+)/);
        if (match) {
            return (parseInt(match[1]) + parseInt(match[2])) / 2;
        }
        return 1.5; // Default 1.5 hours
    });
    
    const totalHours = durations.reduce((sum, hours) => sum + hours, 0);
    return `${Math.ceil(totalHours)} hours`;
}

function calculateRiskLevel(validation) {
    const warnings = validation.filter(v => v.type === 'warning').length;
    const failed = validation.filter(v => v.type === 'failed').length;
    
    if (failed > 0) return 'High';
    if (warnings > 2) return 'Medium';
    return 'Low';
}

function validateParams(params) {
    if (!params.agent) {
        throw new Error('Missing required parameter: agent');
    }
    
    if (!params.task && params.agent !== 'validator') {
        throw new Error('Missing required parameter: task');
    }
    
    if (params.agent === 'validator' && !params.plan) {
        throw new Error('Missing required parameter: plan for validator');
    }
    
    if (params.agent === 'advisor' && (!params.plan || !params.validation)) {
        throw new Error('Missing required parameters for advisor');
    }
}

// Export the main function for IBM Cloud Functions
exports.main = main;
