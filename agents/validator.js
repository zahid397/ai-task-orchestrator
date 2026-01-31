/**
 * Validator Agent Module
 * Validates task plans and identifies risks
 */

class ValidatorAgent {
    constructor() {
        this.validationRules = {
            feasibility: this.validateFeasibility,
            resources: this.validateResources,
            timeline: this.validateTimeline,
            dependencies: this.validateDependencies,
            risks: this.validateRisks
        };
        
        this.riskFactors = {
            high: ['tight timeline', 'complex dependencies', 'unknown technology', 'limited resources', 'multiple stakeholders'],
            medium: ['moderate complexity', 'some dependencies', 'limited expertise', 'budget constraints'],
            low: ['well-defined', 'experienced team', 'ample resources', 'clear requirements']
        };
    }
    
    async validatePlan(task, plan) {
        console.log(`Validating plan with ${plan.length} steps`);
        
        try {
            const validations = [];
            
            // Run all validation rules
            for (const [ruleName, ruleFunction] of Object.entries(this.validationRules)) {
                const result = ruleFunction.call(this, task, plan);
                validations.push(...result);
            }
            
            // Calculate overall score
            const score = this.calculateValidationScore(validations);
            
            // Generate summary
            const summary = this.generateValidationSummary(validations, score);
            
            return {
                success: true,
                validations,
                score,
                summary,
                recommendations: this.generateRecommendations(validations)
            };
            
        } catch (error) {
            console.error('Validator error:', error);
            return {
                success: false,
                error: error.message,
                validations: this.getFallbackValidations()
            };
        }
    }
    
    validateFeasibility(task, plan) {
        const validations = [];
        
        // Check if each step is feasible
        plan.forEach((step, index) => {
            const isFeasible = this.assessStepFeasibility(step);
            
            validations.push({
                id: `feasibility-${index + 1}`,
                type: isFeasible ? 'passed' : 'warning',
                title: `Step ${index + 1} Feasibility`,
                message: isFeasible 
                    ? `"${step.title}" appears feasible`
                    : `"${step.title}" may require additional resources or expertise`,
                details: {
                    stepId: step.id,
                    assessment: isFeasible ? 'Feasible' : 'Needs Review',
                    factors: this.getFeasibilityFactors(step)
                }
            });
        });
        
        // Overall feasibility
        const overallFeasible = validations.every(v => v.type === 'passed');
        validations.push({
            id: 'overall-feasibility',
            type: overallFeasible ? 'passed' : 'warning',
            title: 'Overall Feasibility',
            message: overallFeasible 
                ? 'The overall plan appears feasible'
                : 'Some steps may require adjustment for full feasibility',
            details: {
                assessment: overallFeasible ? 'Good' : 'Needs Attention',
                percentage: Math.round((validations.filter(v => v.type === 'passed').length / plan.length) * 100)
            }
        });
        
        return validations;
    }
    
    validateResources(task, plan) {
        const validations = [];
        let totalResources = new Set();
        
        plan.forEach(step => {
            if (step.resources && Array.isArray(step.resources)) {
                step.resources.forEach(resource => totalResources.add(resource));
            }
        });
        
        // Check resource availability
        const resourceCount = totalResources.size;
        const resourceStatus = resourceCount <= 10 ? 'passed' : 'warning';
        
        validations.push({
            id: 'resource-count',
            type: resourceStatus,
            title: 'Resource Requirements',
            message: resourceStatus === 'passed'
                ? `Plan requires ${resourceCount} distinct resources (manageable)`
                : `Plan requires ${resourceCount} distinct resources (consider consolidation)`,
            details: {
                totalResources: resourceCount,
                assessment: resourceCount <= 10 ? 'Reasonable' : 'High',
                recommendation: resourceCount > 10 ? 'Consider resource consolidation' : 'Good'
            }
        });
        
        // Check for critical resources
        const criticalResources = this.identifyCriticalResources(plan);
        if (criticalResources.length > 0) {
            validations.push({
                id: 'critical-resources',
                type: 'warning',
                title: 'Critical Resources',
                message: `Identified ${criticalResources.length} potentially critical resources`,
                details: {
                    resources: criticalResources,
                    recommendation: 'Ensure availability of critical resources before starting'
                }
            });
        }
        
        return validations;
    }
    
    validateTimeline(task, plan) {
        const validations = [];
        
        // Calculate total duration
        const totalDuration = this.calculatePlanDuration(plan);
        const timelineStatus = this.assessTimeline(totalDuration, plan.length);
        
        validations.push({
            id: 'timeline-assessment',
            type: timelineStatus.status,
            title: 'Timeline Assessment',
            message: timelineStatus.message,
            details: {
                totalDuration,
                steps: plan.length,
                assessment: timelineStatus.assessment,
                recommendation: timelineStatus.recommendation
            }
        });
        
        // Check step durations
        const unbalancedSteps = this.identifyUnbalancedDurations(plan);
        if (unbalancedSteps.length > 0) {
            validations.push({
                id: 'duration-balance',
                type: 'warning',
                title: 'Duration Balance',
                message: `Found ${unbalancedSteps.length} steps with potentially unbalanced durations`,
                details: {
                    steps: unbalancedSteps,
                    recommendation: 'Consider rebalancing durations for better workflow'
                }
            });
        }
        
        return validations;
    }
    
    validateDependencies(task, plan) {
        const validations = [];
        const dependencyGraph = this.buildDependencyGraph(plan);
        
        // Check for circular dependencies
        const circularDeps = this.detectCircularDependencies(dependencyGraph);
        if (circularDeps.length > 0) {
            validations.push({
                id: 'circular-dependencies',
                type: 'failed',
                title: 'Circular Dependencies',
                message: `Found ${circularDeps.length} circular dependency chains`,
                details: {
                    chains: circularDeps,
                    recommendation: 'Resolve circular dependencies before proceeding'
                }
            });
        }
        
        // Check dependency complexity
        const complexDeps = this.identifyComplexDependencies(dependencyGraph);
        if (complexDeps.length > 0) {
            validations.push({
                id: 'complex-dependencies',
                type: 'warning',
                title: 'Complex Dependencies',
                message: `Found ${complexDeps.length} steps with complex dependencies`,
                details: {
                    steps: complexDeps,
                    recommendation: 'Consider simplifying dependency structure'
                }
            });
        }
        
        // Overall dependency assessment
        const depStatus = complexDeps.length === 0 && circularDeps.length === 0 ? 'passed' : 'warning';
        validations.push({
            id: 'dependency-overview',
            type: depStatus,
            title: 'Dependency Structure',
            message: depStatus === 'passed'
                ? 'Dependency structure is clean and manageable'
                : 'Some dependency issues need attention',
            details: {
                totalDependencies: this.countTotalDependencies(plan),
                maxDepth: this.calculateMaxDependencyDepth(dependencyGraph),
                assessment: depStatus === 'passed' ? 'Good' : 'Needs Review'
            }
        });
        
        return validations;
    }
    
    validateRisks(task, plan) {
        const validations = [];
        const risks = this.identifyRisks(plan);
        
        // High risks
        const highRisks = risks.filter(r => r.level === 'high');
        if (highRisks.length > 0) {
            validations.push({
                id: 'high-risks',
                type: 'warning',
                title: 'High Risks Identified',
                message: `Found ${highRisks.length} high-risk areas`,
                details: {
                    risks: highRisks,
                    recommendation: 'Address high risks before proceeding with implementation'
                }
            });
        }
        
        // Medium risks
        const mediumRisks = risks.filter(r => r.level === 'medium');
        if (mediumRisks.length > 0) {
            validations.push({
                id: 'medium-risks',
                type: 'warning',
                title: 'Medium Risks',
                message: `Found ${mediumRisks.length} medium-risk areas to monitor`,
                details: {
                    risks: mediumRisks,
                    recommendation: 'Monitor these risks throughout implementation'
                }
            });
        }
        
        // Risk mitigation assessment
        const mitigationScore = this.assessRiskMitigation(plan);
        validations.push({
            id: 'risk-mitigation',
            type: mitigationScore >= 70 ? 'passed' : 'warning',
            title: 'Risk Mitigation',
            message: mitigationScore >= 70
                ? 'Good risk mitigation planning'
                : 'Consider enhancing risk mitigation strategies',
            details: {
                score: mitigationScore,
                assessment: mitigationScore >= 70 ? 'Good' : 'Needs Improvement',
                recommendation: 'Add specific mitigation strategies for identified risks'
            }
        });
        
        return validations;
    }
    
    assessStepFeasibility(step) {
        // Simple feasibility assessment
        const factors = {
            duration: step.duration && step.duration.includes('hours'),
            resources: step.resources && step.resources.length > 0,
            description: step.description && step.description.length > 20
        };
        
        return Object.values(factors).every(f => f === true);
    }
    
    getFeasibilityFactors(step) {
        return {
            hasDuration: !!step.duration,
            hasResources: step.resources && step.resources.length > 0,
            descriptionLength: step.description ? step.description.length : 0,
            hasDependencies: step.dependencies && step.dependencies.length > 0
        };
    }
    
    identifyCriticalResources(plan) {
        const criticalKeywords = ['specialized', 'expert', 'licensed', 'premium', 'custom', 'rare'];
        const criticalResources = new Set();
        
        plan.forEach(step => {
            if (step.resources) {
                step.resources.forEach(resource => {
                    if (criticalKeywords.some(keyword => 
                        resource.toLowerCase().includes(keyword))) {
                        criticalResources.add(resource);
                    }
                });
            }
        });
        
        return Array.from(criticalResources);
    }
    
    calculatePlanDuration(plan) {
        let totalHours = 0;
        
        plan.forEach(step => {
            const match = step.duration.match(/(\d+)-(\d+)/);
            if (match) {
                totalHours += (parseInt(match[1]) + parseInt(match[2])) / 2;
            } else {
                totalHours += 2; // Default
            }
        });
        
        if (totalHours <= 8) return `${Math.ceil(totalHours)} hours`;
        if (totalHours <= 40) return `${Math.ceil(totalHours / 8)} days`;
        return `${Math.ceil(totalHours / 40)} weeks`;
    }
    
    assessTimeline(duration, stepCount) {
        const daysMatch = duration.match(/(\d+)\s*days/);
        const weeksMatch = duration.match(/(\d+)\s*weeks/);
        
        if (weeksMatch && parseInt(weeksMatch[1]) > 4) {
            return {
                status: 'warning',
                message: 'Timeline may be too long for effective execution',
                assessment: 'Long',
                recommendation: 'Consider breaking into phases or reducing scope'
            };
        }
        
        if (stepCount > 10) {
            return {
                status: 'warning',
                message: 'Many steps may complicate timeline management',
                assessment: 'Complex',
                recommendation: 'Consider consolidating or parallelizing steps'
            };
        }
        
        return {
            status: 'passed',
            message: 'Timeline appears reasonable',
            assessment: 'Good',
            recommendation: 'Monitor progress regularly'
        };
    }
    
    identifyUnbalancedDurations(plan) {
        const unbalanced = [];
        let previousDuration = null;
        
        plan.forEach((step, index) => {
            const match = step.duration.match(/(\d+)-(\d+)/);
            if (match) {
                const avgDuration = (parseInt(match[1]) + parseInt(match[2])) / 2;
                
                if (previousDuration && Math.abs(avgDuration - previousDuration) > 4) {
                    unbalanced.push({
                        step: index + 1,
                        title: step.title,
                        duration: step.duration,
                        difference: Math.abs(avgDuration - previousDuration)
                    });
                }
                
                previousDuration = avgDuration;
            }
        });
        
        return unbalanced;
    }
    
    buildDependencyGraph(plan) {
        const graph = {};
        
        plan.forEach(step => {
            graph[step.id] = step.dependencies || [];
        });
        
        return graph;
    }
    
    detectCircularDependencies(graph) {
        const cycles = [];
        const visited = {};
        const recursionStack = {};
        
        const dfs = (node, path) => {
            if (!visited[node]) {
                visited[node] = true;
                recursionStack[node] = true;
                
                const neighbors = graph[node] || [];
                for (const neighbor of neighbors) {
                    if (!visited[neighbor]) {
                        if (dfs(neighbor, [...path, node])) {
                            return true;
                        }
                    } else if (recursionStack[neighbor]) {
                        cycles.push([...path, node, neighbor]);
                        return true;
                    }
                }
            }
            
            recursionStack[node] = false;
            return false;
        };
        
        Object.keys(graph).forEach(node => {
            if (!visited[node]) {
                dfs(node, []);
            }
        });
        
        return cycles;
    }
    
    identifyComplexDependencies(graph) {
        const complex = [];
        
        Object.entries(graph).forEach(([node, deps]) => {
            if (deps.length > 2) {
                complex.push({
                    step: parseInt(node),
                    dependencies: deps.length,
                    assessment: 'Complex'
                });
            }
        });
        
        return complex;
    }
    
    countTotalDependencies(plan) {
        return plan.reduce((total, step) => total + (step.dependencies ? step.dependencies.length : 0), 0);
    }
    
    calculateMaxDependencyDepth(graph) {
        let maxDepth = 0;
        
        const calculateDepth = (node, depth, visited) => {
            if (visited.has(node)) return depth;
            
            visited.add(node);
            maxDepth = Math.max(maxDepth, depth);
            
            const neighbors = graph[node] || [];
            neighbors.forEach(neighbor => {
                calculateDepth(neighbor, depth + 1, new Set(visited));
            });
        };
        
        Object.keys(graph).forEach(node => {
            calculateDepth(node, 1, new Set());
        });
        
        return maxDepth;
    }
    
    identifyRisks(plan) {
        const risks = [];
        
        plan.forEach((step, index) => {
            const stepRisks = this.analyzeStepRisks(step, index);
            if (stepRisks.length > 0) {
                risks.push(...stepRisks);
            }
        });
        
        return risks;
    }
    
    analyzeStepRisks(step, index) {
        const risks = [];
        const stepText = `${step.title} ${step.description}`.toLowerCase();
        
        // Check for risk indicators
        this.riskFactors.high.forEach(factor => {
            if (stepText.includes(factor)) {
                risks.push({
                    step: index + 1,
                    title: step.title,
                    risk: factor,
                    level: 'high',
                    impact: 'Significant delay or failure risk'
                });
            }
        });
        
        this.riskFactors.medium.forEach(factor => {
            if (stepText.includes(factor)) {
                risks.push({
                    step: index + 1,
                    title: step.title,
                    risk: factor,
                    level: 'medium',
                    impact: 'Moderate delay or quality risk'
                });
            }
        });
        
        return risks;
    }
    
    assessRiskMitigation(plan) {
        let mitigationScore = 0;
        let totalFactors = 0;
        
        plan.forEach(step => {
            // Check for mitigation indicators
            if (step.description && step.description.toLowerCase().includes('mitigat')) {
                mitigationScore += 20;
            }
            if (step.resources && step.resources.some(r => r.toLowerCase().includes('backup'))) {
                mitigationScore += 15;
            }
            if (step.dependencies && step.dependencies.length < 3) {
                mitigationScore += 10;
            }
            
            totalFactors += 3;
        });
        
        return Math.min(100, Math.round((mitigationScore / (totalFactors * 10)) * 100));
    }
    
    calculateValidationScore(validations) {
        const weights = {
            'passed': 1,
            'warning': 0.5,
            'failed': 0
        };
        
        const totalScore = validations.reduce((score, validation) => {
            return score + (weights[validation.type] || 0);
        }, 0);
        
        const maxScore = validations.length;
        return Math.round((totalScore / maxScore) * 100);
    }
    
    generateValidationSummary(validations, score) {
        const passed = validations.filter(v => v.type === 'passed').length;
        const warnings = validations.filter(v => v.type === 'warning').length;
        const failed = validations.filter(v => v.type === 'failed').length;
        
        let status = 'Good';
        if (score < 60) status = 'Needs Major Improvements';
        else if (score < 80) status = 'Needs Some Improvements';
        else if (score < 90) status = 'Satisfactory';
        
        return {
            score,
            status,
            breakdown: { passed, warnings, failed },
            overall: score >= 80 ? 'Plan is generally valid' : 'Plan needs review'
        };
    }
    
    generateRecommendations(validations) {
        const recommendations = [];
        
        // Analyze validation results for recommendations
        const warnings = validations.filter(v => v.type === 'warning');
        const failures = validations.filter(v => v.type === 'failed');
        
        if (failures.length > 0) {
            recommendations.push({
                priority: 'High',
                action: 'Address failed validations before proceeding',
                reason: `${failures.length} critical issues need resolution`
            });
        }
        
        if (warnings.length > 3) {
            recommendations.push({
                priority: 'Medium',
                action: 'Review and address warning validations',
                reason: `Multiple (${warnings.length}) areas need attention`
            });
        }
        
        // Specific recommendations based on common issues
        const resourceWarnings = validations.filter(v => 
            v.title.includes('Resource') && v.type === 'warning');
        if (resourceWarnings.length > 0) {
            recommendations.push({
                priority: 'Medium',
                action: 'Review resource allocation and availability',
                reason: 'Resource-related warnings identified'
            });
        }
        
        const timelineWarnings = validations.filter(v => 
            v.title.includes('Timeline') && v.type === 'warning');
        if (timelineWarnings.length > 0) {
            recommendations.push({
                priority: 'Medium',
                action: 'Review timeline estimates and dependencies',
                reason: 'Timeline-related warnings identified'
            });
        }
        
        return recommendations;
    }
    
    getFallbackValidations() {
        return [
            {
                id: 'fallback-1',
                type: 'passed',
                title: 'Basic Structure',
                message: 'Plan has basic structure and steps'
            },
            {
                id: 'fallback-2',
                type: 'warning',
                title: 'Limited Detail',
                message: 'Plan lacks detailed validation due to system limitations'
            }
        ];
    }
}

// Export the agent
module.exports = ValidatorAgent;
