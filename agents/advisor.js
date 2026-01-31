/**
 * Advisor Agent Module
 * Provides expert advice and recommendations
 */

class AdvisorAgent {
    constructor() {
        this.expertiseDomains = {
            strategy: this.getStrategyAdvice,
            technology: this.getTechnologyAdvice,
            project: this.getProjectAdvice,
            team: this.getTeamAdvice,
            risk: this.getRiskAdvice,
            quality: this.getQualityAdvice
        };
        
        this.bestPractices = this.loadBestPractices();
    }
    
    async provideAdvice(task, plan, validation) {
        console.log('Providing expert advice based on analysis');
        
        try {
            // Analyze the situation
            const analysis = this.analyzeSituation(task, plan, validation);
            
            // Generate advice for each relevant domain
            const advice = [];
            const scores = {};
            
            for (const [domain, adviceFunction] of Object.entries(this.expertiseDomains)) {
                const domainAdvice = await adviceFunction.call(this, analysis);
                if (domainAdvice && domainAdvice.length > 0) {
                    advice.push(...domainAdvice);
                    scores[domain] = this.scoreDomainRelevance(domain, analysis);
                }
            }
            
            // Sort advice by priority
            advice.sort((a, b) => b.priority - a.priority);
            
            // Generate summary
            const summary = this.generateAdviceSummary(advice, scores);
            
            return {
                success: true,
                advice,
                summary,
                metadata: {
                    domains: Object.keys(scores),
                    totalRecommendations: advice.length,
                    priorityBreakdown: this.calculatePriorityBreakdown(advice)
                }
            };
            
        } catch (error) {
            console.error('Advisor error:', error);
            return {
                success: false,
                error: error.message,
                advice: this.getFallbackAdvice()
            };
        }
    }
    
    analyzeSituation(task, plan, validation) {
        return {
            taskCharacteristics: this.analyzeTask(task),
            planMetrics: this.analyzePlanMetrics(plan),
            validationResults: this.analyzeValidation(validation),
            riskProfile: this.calculateRiskProfile(plan, validation),
            complexityScore: this.calculateComplexityScore(plan)
        };
    }
    
    async getStrategyAdvice(analysis) {
        const advice = [];
        
        // Strategy advice based on complexity
        if (analysis.complexityScore > 7) {
            advice.push({
                id: 'strategy-1',
                type: 'strategy',
                title: 'Phased Implementation Approach',
                content: 'For complex tasks, consider a phased implementation approach. Start with a minimum viable solution and iterate based on feedback.',
                priority: 9,
                rationale: 'High complexity tasks benefit from incremental delivery',
                implementation: 'Break into 2-3 week sprints with clear deliverables',
                expectedImpact: 'Reduced risk, faster feedback, better adaptation'
            });
        }
        
        // Advice based on plan metrics
        if (analysis.planMetrics.stepCount > 8) {
            advice.push({
                id: 'strategy-2',
                type: 'strategy',
                title: 'Parallel Execution Strategy',
                content: 'Consider parallel execution of independent steps to reduce overall timeline.',
                priority: 7,
                rationale: 'Multiple dependent steps can be executed simultaneously',
                implementation: 'Identify and group independent steps for parallel execution',
                expectedImpact: 'Timeline reduction of 20-30%'
            });
        }
        
        return advice;
    }
    
    async getTechnologyAdvice(analysis) {
        const advice = [];
        
        // Technology stack advice
        if (analysis.taskCharacteristics.requiresTech) {
            advice.push({
                id: 'tech-1',
                type: 'technology',
                title: 'Technology Stack Evaluation',
                content: 'Conduct thorough evaluation of technology options considering maintainability, community support, and team expertise.',
                priority: 8,
                rationale: 'Right technology choices reduce long-term maintenance costs',
                implementation: 'Create evaluation matrix with weighted criteria',
                expectedImpact: 'Better long-term sustainability and reduced tech debt'
            });
        }
        
        // Tooling advice
        if (analysis.planMetrics.averageResources > 3) {
            advice.push({
                id: 'tech-2',
                type: 'technology',
                title: 'Integrated Tooling Platform',
                content: 'Consider using an integrated platform to manage multiple tools and reduce context switching.',
                priority: 6,
                rationale: 'Multiple disparate tools increase cognitive load',
                implementation: 'Evaluate platforms like IBM watsonx Orchestrate for integration',
                expectedImpact: 'Improved efficiency and reduced tool management overhead'
            });
        }
        
        return advice;
    }
    
    async getProjectAdvice(analysis) {
        const advice = [];
        
        // Project management advice
        advice.push({
            id: 'project-1',
            type: 'project',
            title: 'Agile Project Management',
            content: 'Adopt agile methodologies with regular sprints, daily standups, and retrospectives.',
            priority: analysis.complexityScore > 5 ? 9 : 7,
            rationale: 'Agile approaches provide flexibility and regular feedback',
            implementation: '2-week sprints with defined ceremonies and artifacts',
            expectedImpact: 'Better adaptability and stakeholder satisfaction'
        });
        
        // Communication advice
        if (analysis.riskProfile.communicationRisks > 0) {
            advice.push({
                id: 'project-2',
                type: 'project',
                title: 'Structured Communication Plan',
                content: 'Implement a structured communication plan with regular updates to all stakeholders.',
                priority: 8,
                rationale: 'Clear communication reduces misunderstandings and aligns expectations',
                implementation: 'Weekly status reports, bi-weekly stakeholder meetings',
                expectedImpact: 'Improved alignment and reduced rework'
            });
        }
        
        return advice;
    }
    
    async getTeamAdvice(analysis) {
        const advice = [];
        
        // Team structure advice
        if (analysis.planMetrics.stepCount > 5) {
            advice.push({
                id: 'team-1',
                type: 'team',
                title: 'Cross-Functional Team Structure',
                content: 'Organize team members into cross-functional squads with end-to-end responsibility.',
                priority: 8,
                rationale: 'Cross-functional teams reduce dependencies and improve ownership',
                implementation: 'Create squads with mixed skills (development, testing, analysis)',
                expectedImpact: 'Faster delivery and improved quality'
            });
        }
        
        // Skills development advice
        if (analysis.taskCharacteristics.requiresSpecializedSkills) {
            advice.push({
                id: 'team-2',
                type: 'team',
                title: 'Skill Development Plan',
                content: 'Create a skill development plan to address any gaps in team expertise.',
                priority: 7,
                rationale: 'Proactive skill development prevents bottlenecks',
                implementation: 'Identify skill gaps and create training/mentoring plans',
                expectedImpact: 'Reduced dependency on external experts'
            });
        }
        
        return advice;
    }
    
    async getRiskAdvice(analysis) {
        const advice = [];
        
        // Risk management advice
        if (analysis.riskProfile.totalRisks > 3) {
            advice.push({
                id: 'risk-1',
                type: 'risk',
                title: 'Proactive Risk Management',
                content: 'Implement a proactive risk management process with regular risk reviews.',
                priority: 9,
                rationale: 'Early risk identification prevents major issues',
                implementation: 'Weekly risk review meetings and risk register maintenance',
                expectedImpact: 'Reduced unexpected issues and better preparedness'
            });
        }
        
        // Contingency planning
        if (analysis.riskProfile.highRisks > 0) {
            advice.push({
                id: 'risk-2',
                type: 'risk',
                title: 'Contingency Planning',
                content: 'Develop contingency plans for high-risk areas with clear trigger points.',
                priority: 10,
                rationale: 'Prepared contingencies reduce impact of realized risks',
                implementation: 'Identify mitigation strategies and backup plans',
                expectedImpact: 'Minimized disruption when risks materialize'
            });
        }
        
        return advice;
    }
    
    async getQualityAdvice(analysis) {
        const advice = [];
        
        // Quality assurance advice
        advice.push({
            id: 'quality-1',
            type: 'quality',
            title: 'Shift-Left Quality Approach',
            content: 'Implement quality checks early in the process rather than at the end.',
            priority: 8,
            rationale: 'Early quality checks reduce rework and improve outcomes',
            implementation: 'Include quality criteria in each step and regular reviews',
            expectedImpact: 'Higher quality outcomes and reduced rework'
        });
        
        // Testing strategy
        if (analysis.taskCharacteristics.requiresDevelopment) {
            advice.push({
                id: 'quality-2',
                type: 'quality',
                title: 'Comprehensive Testing Strategy',
                content: 'Develop a multi-layered testing strategy covering unit, integration, and acceptance testing.',
                priority: 9,
                rationale: 'Comprehensive testing catches issues at different levels',
                implementation: 'Define testing pyramid and automation strategy',
                expectedImpact: 'Higher confidence in deliverables and fewer production issues'
            });
        }
        
        return advice;
    }
    
    analyzeTask(task) {
        const taskLower = task.toLowerCase();
        
        return {
            length: task.length,
            wordCount: task.split(/\s+/).length,
            requiresTech: taskLower.includes('develop') || taskLower.includes('app') || 
                          taskLower.includes('software') || taskLower.includes('system'),
            requiresAnalysis: taskLower.includes('analyze') || taskLower.includes('research'),
            requiresStrategy: taskLower.includes('strategy') || taskLower.includes('plan'),
            requiresSpecializedSkills: taskLower.includes('specialized') || 
                                       taskLower.includes('expert') || 
                                       taskLower.includes('certified')
        };
    }
    
    analyzePlanMetrics(plan) {
        return {
            stepCount: plan.length,
            averageDuration: this.calculateAverageDuration(plan),
            averageResources: this.calculateAverageResources(plan),
            dependencyComplexity: this.analyzeDependencyComplexity(plan),
            resourceVariety: this.calculateResourceVariety(plan)
        };
    }
    
    analyzeValidation(validation) {
        if (!validation || !validation.validations) {
            return { passed: 0, warnings: 0, failed: 0, score: 0 };
        }
        
        const validations = validation.validations;
        return {
            passed: validations.filter(v => v.type === 'passed').length,
            warnings: validations.filter(v => v.type === 'warning').length,
            failed: validations.filter(v => v.type === 'failed').length,
            score: validation.score || 0
        };
    }
    
    calculateRiskProfile(plan, validation) {
        const risks = {
            timelineRisks: 0,
            resourceRisks: 0,
            dependencyRisks: 0,
            qualityRisks: 0,
            communicationRisks: 0
        };
        
        // Analyze plan for risks
        plan.forEach(step => {
            const stepText = `${step.title} ${step.description}`.toLowerCase();
            
            if (stepText.includes('tight') || stepText.includes('urgent')) {
                risks.timelineRisks++;
            }
            if (stepText.includes('limited') || stepText.includes('scarce')) {
                risks.resourceRisks++;
            }
            if (step.dependencies && step.dependencies.length > 2) {
                risks.dependencyRisks++;
            }
        });
        
        // Add validation insights
        if (validation && validation.validations) {
            validation.validations.forEach(v => {
                if (v.type === 'warning' || v.type === 'failed') {
                    if (v.title.includes('Resource')) risks.resourceRisks++;
                    if (v.title.includes('Timeline')) risks.timelineRisks++;
                    if (v.title.includes('Dependency')) risks.dependencyRisks++;
                }
            });
        }
        
        risks.totalRisks = Object.values(risks).reduce((a, b) => a + b, 0);
        risks.highRisks = Math.ceil(risks.totalRisks * 0.3); // Estimate 30% as high risk
        
        return risks;
    }
    
    calculateComplexityScore(plan) {
        let score = 0;
        
        // Base score from step count
        score += Math.min(plan.length * 0.5, 5);
        
        // Add points for dependencies
        const totalDependencies = plan.reduce((sum, step) => 
            sum + (step.dependencies ? step.dependencies.length : 0), 0);
        score += Math.min(totalDependencies * 0.3, 3);
        
        // Add points for resource variety
        const uniqueResources = new Set();
        plan.forEach(step => {
            if (step.resources) {
                step.resources.forEach(r => uniqueResources.add(r));
            }
        });
        score += Math.min(uniqueResources.size * 0.2, 2);
        
        return Math.round(score);
    }
    
    calculateAverageDuration(plan) {
        let totalHours = 0;
        let count = 0;
        
        plan.forEach(step => {
            const match = step.duration.match(/(\d+)-(\d+)/);
            if (match) {
                totalHours += (parseInt(match[1]) + parseInt(match[2])) / 2;
                count++;
            }
        });
        
        return count > 0 ? (totalHours / count).toFixed(1) : 'N/A';
    }
    
    calculateAverageResources(plan) {
        let totalResources = 0;
        let count = 0;
        
        plan.forEach(step => {
            if (step.resources) {
                totalResources += step.resources.length;
                count++;
            }
        });
        
        return count > 0 ? (totalResources / count).toFixed(1) : 0;
    }
    
    analyzeDependencyComplexity(plan) {
        let maxDependencies = 0;
        let totalDependencies = 0;
        
        plan.forEach(step => {
            const deps = step.dependencies ? step.dependencies.length : 0;
            totalDependencies += deps;
            if (deps > maxDependencies) maxDependencies = deps;
        });
        
        return {
            max: maxDependencies,
            average: plan.length > 0 ? (totalDependencies / plan.length).toFixed(1) : 0,
            total: totalDependencies
        };
    }
    
    calculateResourceVariety(plan) {
        const uniqueResources = new Set();
        
        plan.forEach(step => {
            if (step.resources) {
                step.resources.forEach(r => uniqueResources.add(r));
            }
        });
        
        return {
            unique: uniqueResources.size,
            varietyScore: Math.min(uniqueResources.size * 10, 100)
        };
    }
    
    scoreDomainRelevance(domain, analysis) {
        const scores = {
            strategy: analysis.complexityScore * 10,
            technology: analysis.taskCharacteristics.requiresTech ? 80 : 30,
            project: 70, // Always relevant
            team: analysis.planMetrics.stepCount > 3 ? 75 : 50,
            risk: analysis.riskProfile.totalRisks * 15,
            quality: 65 // Always relevant
        };
        
        return Math.min(scores[domain] || 50, 100);
    }
    
    generateAdviceSummary(advice, domainScores) {
        const priorityCounts = {
            critical: advice.filter(a => a.priority >= 9).length,
            high: advice.filter(a => a.priority >= 7 && a.priority < 9).length,
            medium: advice.filter(a => a.priority >= 5 && a.priority < 7).length,
            low: advice.filter(a => a.priority < 5).length
        };
        
        // Calculate average domain score
        const avgDomainScore = Object.values(domainScores).length > 0
            ? Math.round(Object.values(domainScores).reduce((a, b) => a + b, 0) / Object.values(domainScores).length)
            : 0;
        
        return {
            totalAdvice: advice.length,
            priorityBreakdown: priorityCounts,
            topDomains: this.getTopDomains(domainScores),
            overallRelevance: avgDomainScore,
            keyFocusAreas: this.identifyFocusAreas(advice),
            implementationTimeline: this.estimateImplementationTimeline(advice)
        };
    }
    
    getTopDomains(domainScores) {
        return Object.entries(domainScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([domain, score]) => ({ domain, score }));
    }
    
    identifyFocusAreas(advice) {
        const areas = {};
        
        advice.forEach(item => {
            if (item.priority >= 8) {
                const key = item.type;
                if (!areas[key]) areas[key] = 0;
                areas[key]++;
            }
        });
        
        return Object.entries(areas)
            .sort((a, b) => b[1] - a[1])
            .map(([area, count]) => area)
            .slice(0, 3);
    }
    
    estimateImplementationTimeline(advice) {
        const criticalAdvice = advice.filter(a => a.priority >= 9);
        const highAdvice = advice.filter(a => a.priority >= 7 && a.priority < 9);
        
        const timeline = {
            immediate: criticalAdvice.length,
            shortTerm: highAdvice.length,
            estimatedWeeks: Math.ceil((criticalAdvice.length * 1 + highAdvice.length * 2) / 5)
        };
        
        return timeline;
    }
    
    calculatePriorityBreakdown(advice) {
        return {
            critical: advice.filter(a => a.priority >= 9).length,
            high: advice.filter(a => a.priority >= 7 && a.priority < 9).length,
            medium: advice.filter(a => a.priority >= 5 && a.priority < 7).length,
            low: advice.filter(a => a.priority < 5).length
        };
    }
    
    loadBestPractices() {
        return {
            agile: [
                "Use time-boxed iterations (sprints)",
                "Conduct regular retrospectives",
                "Maintain a prioritized backlog",
                "Use visual management (Kanban/Scrum boards)"
            ],
            quality: [
                "Automate testing where possible",
                "Conduct code reviews",
                "Use continuous integration",
                "Monitor quality metrics"
            ],
            communication: [
                "Establish clear communication channels",
                "Document decisions and rationale",
                "Provide regular status updates",
                "Use visual aids for complex information"
            ],
            risk: [
                "Maintain a risk register",
                "Conduct regular risk reviews",
                "Develop contingency plans",
                "Monitor risk triggers"
            ]
        };
    }
    
    getFallbackAdvice() {
        return [
            {
                id: 'fallback-1',
                type: 'general',
                title: 'General Best Practices',
                content: 'Follow established project management best practices and maintain clear documentation.',
                priority: 5,
                rationale: 'Basic practices provide foundation for success',
                implementation: 'Regular check-ins and documentation',
                expectedImpact: 'Improved project management and outcomes'
            }
        ];
    }
}

// Export the agent
module.exports = AdvisorAgent;
