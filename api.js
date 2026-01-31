/**
 * Frontend API Client for AI Task Orchestrator
 * Communicates with IBM Cloud Functions backend
 */

class TaskOrchestratorAPI {
    constructor() {
        // In production, this would be your IBM Cloud Function endpoint
        this.baseURL = 'https://us-south.functions.cloud.ibm.com/api/v1/web';
        this.endpoints = {
            planner: '/namespace/ai-orchestrator/planner',
            validator: '/namespace/ai-orchestrator/validator',
            advisor: '/namespace/ai-orchestrator/advisor',
            orchestrate: '/namespace/ai-orchestrator/orchestrate'
        };
        
        // Demo mode flag
        this.demoMode = true;
    }
    
    async orchestrateTask(task, complexity) {
        if (this.demoMode) {
            // Return simulated response for demo purposes
            return this.simulateOrchestration(task, complexity);
        }
        
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.orchestrate}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    task,
                    complexity,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.validateResponse(data);
            
        } catch (error) {
            console.error('API Error:', error);
            throw new Error('Failed to orchestrate task. Please try again.');
        }
    }
    
    async callPlanner(task, complexity) {
        if (this.demoMode) {
            return this.simulatePlannerResponse(task, complexity);
        }
        
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.planner}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    task,
                    complexity,
                    model: 'ibm/granite-13b-chat-v2'
                })
            });
            
            return await response.json();
            
        } catch (error) {
            console.error('Planner API Error:', error);
            throw error;
        }
    }
    
    async callValidator(task, plan) {
        if (this.demoMode) {
            return this.simulateValidatorResponse(plan);
        }
        
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.validator}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    task,
                    plan,
                    model: 'ibm/granite-13b-chat-v2'
                })
            });
            
            return await response.json();
            
        } catch (error) {
            console.error('Validator API Error:', error);
            throw error;
        }
    }
    
    async callAdvisor(task, plan, validation) {
        if (this.demoMode) {
            return this.simulateAdvisorResponse({ task, plan, validation });
        }
        
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.advisor}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    task,
                    plan,
                    validation,
                    model: 'ibm/granite-13b-chat-v2'
                })
            });
            
            return await response.json();
            
        } catch (error) {
            console.error('Advisor API Error:', error);
            throw error;
        }
    }
    
    simulateOrchestration(task, complexity) {
        // Simulate the complete orchestration process
        return new Promise((resolve) => {
            setTimeout(() => {
                const plan = this.simulatePlannerResponse(task, complexity);
                const validation = this.simulateValidatorResponse(plan);
                const advice = this.simulateAdvisorResponse({ task, plan, validation });
                
                resolve({
                    success: true,
                    data: {
                        plan,
                        validation,
                        advice,
                        summary: {
                            complexity,
                            steps: plan.length,
                            risks: validation.filter(v => v.type === 'warning').length,
                            recommendations: advice.length
                        }
                    },
                    timestamp: new Date().toISOString()
                });
            }, 2000);
        });
    }
    
    simulatePlannerResponse(task, complexity) {
        const baseSteps = [
            {
                id: 1,
                title: "Requirements Analysis",
                description: "Analyze and document all requirements, constraints, and success criteria for the task.",
                duration: "1-2 hours",
                resources: ["Stakeholder Interviews", "Requirements Template", "Analysis Framework"]
            },
            {
                id: 2,
                title: "Research & Benchmarking",
                description: "Research existing solutions, best practices, and gather relevant data and insights.",
                duration: "2-3 hours",
                resources: ["Research Databases", "Case Studies", "Industry Reports"]
            },
            {
                id: 3,
                title: "Strategy Formulation",
                description: "Develop comprehensive strategy including methodology, approach, and high-level plan.",
                duration: "2-3 hours",
                resources: ["Strategy Canvas", "Decision Matrix", "Planning Tools"]
            }
        ];
        
        const additionalSteps = [
            {
                id: 4,
                title: "Resource Planning",
                description: "Identify and allocate required resources including team, budget, and tools.",
                duration: "1-2 hours",
                resources: ["Resource Calculator", "Budget Template", "Team Structure"]
            },
            {
                id: 5,
                title: "Risk Analysis",
                description: "Identify potential risks and develop mitigation strategies.",
                duration: "1-2 hours",
                resources: ["Risk Matrix", "Contingency Plan", "Impact Analysis"]
            },
            {
                id: 6,
                title: "Implementation Roadmap",
                description: "Create detailed implementation plan with phases and milestones.",
                duration: "2-3 hours",
                resources: ["Gantt Chart", "Timeline Template", "Milestone Tracker"]
            }
        ];
        
        let steps = [...baseSteps];
        
        if (complexity === 'medium' || complexity === 'complex') {
            steps = steps.concat(additionalSteps.slice(0, 2));
        }
        
        if (complexity === 'complex') {
            steps = steps.concat(additionalSteps.slice(2));
        }
        
        return steps;
    }
    
    simulateValidatorResponse(plan) {
        return [
            {
                id: 1,
                type: "passed",
                title: "Task Definition",
                message: "Task is well-defined with clear objectives and scope."
            },
            {
                id: 2,
                type: "passed",
                title: "Resource Estimation",
                message: "Resource requirements are realistic and properly estimated."
            },
            {
                id: 3,
                type: "warning",
                title: "Timeline Assessment",
                message: "Consider adding buffer time for unexpected delays."
            },
            {
                id: 4,
                type: "passed",
                title: "Success Metrics",
                message: "Clear success metrics defined for each phase."
            },
            {
                id: 5,
                type: "warning",
                title: "Dependencies",
                message: "Some external dependencies identified that may require coordination."
            }
        ];
    }
    
    simulateAdvisorResponse(data) {
        return [
            {
                id: 1,
                type: "strategy",
                title: "Iterative Approach",
                content: "Consider breaking the implementation into smaller, iterative cycles for faster feedback and adjustments."
            },
            {
                id: 2,
                type: "technology",
                title: "Tool Selection",
                content: "Evaluate and select appropriate tools early in the process to avoid integration issues later."
            },
            {
                id: 3,
                type: "team",
                title: "Skill Assessment",
                content: "Conduct skill gap analysis and plan for training or hiring as needed."
            },
            {
                id: 4,
                type: "communication",
                title: "Stakeholder Updates",
                content: "Establish regular communication channels with all stakeholders to ensure alignment."
            }
        ];
    }
    
    validateResponse(data) {
        // Basic response validation
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response format');
        }
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data;
    }
    
    // Utility method to set API credentials
    setCredentials(apiKey, endpoint) {
        if (endpoint) {
            this.baseURL = endpoint;
        }
        
        // In production, you would use the API key for authentication
        this.apiKey = apiKey;
        this.demoMode = false;
    }
}

// Export singleton instance
const apiClient = new TaskOrchestratorAPI();
export default apiClient;
