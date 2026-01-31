/**
 * Planner Agent Module
 * Breaks down tasks into structured steps
 */

class PlannerAgent {
    constructor() {
        this.templates = {
            simple: this.getSimpleTemplate(),
            medium: this.getMediumTemplate(),
            complex: this.getComplexTemplate()
        };
    }
    
    async planTask(task, complexity = 'medium') {
        console.log(`Planning task with complexity: ${complexity}`);
        
        try {
            // Analyze task type
            const taskType = this.analyzeTaskType(task);
            
            // Get appropriate template
            const template = this.templates[complexity] || this.templates.medium;
            
            // Generate plan
            const plan = this.generatePlan(task, taskType, template);
            
            // Enhance with AI insights
            const enhancedPlan = await this.enhanceWithAI(plan, task);
            
            return {
                success: true,
                plan: enhancedPlan,
                metadata: {
                    taskType,
                    complexity,
                    steps: enhancedPlan.length,
                    estimatedTotalDuration: this.calculateTotalDuration(enhancedPlan)
                }
            };
            
        } catch (error) {
            console.error('Planner error:', error);
            return {
                success: false,
                error: error.message,
                plan: this.getFallbackPlan(task)
            };
        }
    }
    
    analyzeTaskType(task) {
        const taskLower = task.toLowerCase();
        
        if (taskLower.includes('marketing') || taskLower.includes('campaign')) {
            return 'marketing';
        } else if (taskLower.includes('develop') || taskLower.includes('app') || taskLower.includes('software')) {
            return 'development';
        } else if (taskLower.includes('plan') || taskLower.includes('strategy')) {
            return 'strategy';
        } else if (taskLower.includes('analy') || taskLower.includes('research')) {
            return 'analysis';
        } else if (taskLower.includes('design') || taskLower.includes('create')) {
            return 'design';
        } else {
            return 'general';
        }
    }
    
    generatePlan(task, taskType, template) {
        const plan = [];
        const stepCount = template.steps;
        
        for (let i = 0; i < stepCount; i++) {
            const step = {
                id: i + 1,
                title: this.generateStepTitle(i, taskType),
                description: this.generateStepDescription(i, task, taskType),
                duration: this.generateStepDuration(i, taskType),
                resources: this.generateStepResources(i, taskType),
                dependencies: i > 0 ? [i] : [],
                successCriteria: this.generateSuccessCriteria(i, taskType)
            };
            
            plan.push(step);
        }
        
        return plan;
    }
    
    async enhanceWithAI(plan, task) {
        // In production, this would call IBM watsonx
        // For now, we'll add some intelligent enhancements
        
        return plan.map((step, index) => ({
            ...step,
            aiInsights: this.generateAIInsights(step, index, plan.length),
            priority: this.calculatePriority(index, plan.length),
            riskLevel: this.calculateRiskLevel(index)
        }));
    }
    
    generateStepTitle(stepIndex, taskType) {
        const titles = {
            marketing: [
                "Market Research & Analysis",
                "Target Audience Definition",
                "Strategy Development",
                "Channel Selection",
                "Campaign Creation",
                "Performance Tracking"
            ],
            development: [
                "Requirements Gathering",
                "System Design",
                "Technology Stack Selection",
                "Development Setup",
                "Core Implementation",
                "Testing & Deployment"
            ],
            strategy: [
                "Situation Analysis",
                "Goal Setting",
                "Strategy Formulation",
                "Action Planning",
                "Resource Allocation",
                "Implementation Roadmap"
            ],
            general: [
                "Task Analysis & Scoping",
                "Research & Information Gathering",
                "Planning & Strategy",
                "Execution & Implementation",
                "Review & Quality Assurance",
                "Documentation & Delivery"
            ]
        };
        
        const typeTitles = titles[taskType] || titles.general;
        return typeTitles[stepIndex % typeTitles.length];
    }
    
    generateStepDescription(stepIndex, task, taskType) {
        const baseDescriptions = [
            `Analyze the requirements and scope of: "${task.substring(0, 50)}..."`,
            `Research relevant information, best practices, and existing solutions`,
            `Develop a comprehensive plan and strategy for execution`,
            `Implement the planned approach with regular progress checks`,
            `Review outcomes, gather feedback, and make necessary adjustments`,
            `Document results and prepare for delivery or next phases`
        ];
        
        return baseDescriptions[stepIndex % baseDescriptions.length];
    }
    
    generateStepDuration(stepIndex, taskType) {
        const durations = {
            0: "1-2 hours",
            1: "2-3 hours",
            2: "3-4 hours",
            3: "4-6 hours",
            4: "2-3 hours",
            5: "1-2 hours"
        };
        
        return durations[stepIndex] || "2-3 hours";
    }
    
    generateStepResources(stepIndex, taskType) {
        const resourceSets = {
            marketing: [
                ["Market Research Tools", "Analytics Platforms"],
                ["Audience Persona Templates", "Demographic Data"],
                ["Strategy Frameworks", "Competitive Analysis"],
                ["Channel Analytics", "Budget Planning Tools"],
                ["Creative Tools", "Content Management Systems"],
                ["KPI Dashboards", "Reporting Tools"]
            ],
            development: [
                ["Requirements Documents", "User Stories"],
                ["Design Tools", "Architecture Diagrams"],
                ["Technology Evaluation Matrix", "Proof of Concepts"],
                ["Development Environment", "Version Control"],
                ["Coding Standards", "Development Frameworks"],
                ["Testing Frameworks", "Deployment Pipelines"]
            ],
            general: [
                ["Analysis Templates", "Documentation Tools"],
                ["Research Databases", "Information Sources"],
                ["Planning Frameworks", "Project Management Tools"],
                ["Execution Checklists", "Progress Tracking"],
                ["Quality Assurance Checklists", "Feedback Mechanisms"],
                ["Documentation Templates", "Presentation Tools"]
            ]
        };
        
        const resources = resourceSets[taskType] || resourceSets.general;
        return resources[stepIndex % resources.length];
    }
    
    generateSuccessCriteria(stepIndex, taskType) {
        const criteria = {
            marketing: [
                "Clear understanding of market landscape",
                "Well-defined target audience segments",
                "Comprehensive marketing strategy document",
                "Selected channels with rationale",
                "Complete campaign assets",
                "Established tracking mechanisms"
            ],
            development: [
                "Documented requirements and specifications",
                "Approved system design and architecture",
                "Selected and validated technology stack",
                "Configured development environment",
                "Working core functionality",
                "Tested and deployed solution"
            ]
        };
        
        const typeCriteria = criteria[taskType] || criteria.development;
        return typeCriteria[stepIndex % typeCriteria.length];
    }
    
    generateAIInsights(step, index, totalSteps) {
        const insights = [
            "Consider involving stakeholders early for better alignment",
            "Research phase is critical for informed decision making",
            "Agile approaches work well for complex, evolving tasks",
            "Regular checkpoints help maintain momentum and quality",
            "Documentation saves time in long-term maintenance",
            "Continuous feedback loops improve final outcomes"
        ];
        
        return insights[index % insights.length];
    }
    
    calculatePriority(index, totalSteps) {
        if (index === 0) return "Critical";
        if (index < Math.floor(totalSteps / 2)) return "High";
        if (index === totalSteps - 1) return "Medium";
        return "Normal";
    }
    
    calculateRiskLevel(index) {
        if (index === 0) return "Low"; // Planning phase
        if (index === 1) return "Medium"; // Research phase
        return "Variable"; // Execution phases
    }
    
    calculateTotalDuration(plan) {
        const durations = plan.map(step => {
            const match = step.duration.match(/(\d+)-(\d+)/);
            if (match) {
                return (parseInt(match[1]) + parseInt(match[2])) / 2;
            }
            return 2; // Default 2 hours
        });
        
        const totalHours = durations.reduce((sum, hours) => sum + hours, 0);
        
        if (totalHours <= 8) return `${totalHours} hours`;
        if (totalHours <= 40) return `${Math.ceil(totalHours / 8)} days`;
        return `${Math.ceil(totalHours / 40)} weeks`;
    }
    
    getSimpleTemplate() {
        return {
            steps: 3,
            description: "Basic 3-step plan for simple tasks",
            focus: "Efficiency and simplicity"
        };
    }
    
    getMediumTemplate() {
        return {
            steps: 5,
            description: "Comprehensive 5-step plan for medium complexity tasks",
            focus: "Balance of detail and practicality"
        };
    }
    
    getComplexTemplate() {
        return {
            steps: 7,
            description: "Detailed 7-step plan for complex tasks",
            focus: "Thorough analysis and risk management"
        };
    }
    
    getFallbackPlan(task) {
        return [
            {
                id: 1,
                title: "Initial Analysis",
                description: `Analyze the task: ${task.substring(0, 100)}`,
                duration: "1-2 hours",
                resources: ["Basic Analysis Tools"],
                dependencies: [],
                successCriteria: "Clear understanding of task requirements",
                priority: "High",
                riskLevel: "Low"
            },
            {
                id: 2,
                title: "Execution Planning",
                description: "Plan the execution approach and methodology",
                duration: "2-3 hours",
                resources: ["Planning Framework"],
                dependencies: [1],
                successCriteria: "Detailed execution plan",
                priority: "High",
                riskLevel: "Medium"
            },
            {
                id: 3,
                title: "Implementation",
                description: "Execute the planned approach",
                duration: "4-6 hours",
                resources: ["Implementation Tools"],
                dependencies: [2],
                successCriteria: "Task objectives achieved",
                priority: "Critical",
                riskLevel: "Variable"
            }
        ];
    }
}

// Export the agent
module.exports = PlannerAgent;
