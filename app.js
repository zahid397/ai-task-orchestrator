class AITaskOrchestrator {
    constructor() {
        this.taskInput = document.getElementById('taskInput');
        this.processBtn = document.getElementById('processBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.demoBtn = document.getElementById('demoBtn');
        this.charCount = document.getElementById('charCount');
        this.complexitySelect = document.getElementById('complexitySelect');
        
        // Status elements
        this.progressFill = document.getElementById('progressFill');
        this.executionTime = document.getElementById('executionTime');
        this.statusItems = {
            planner: document.getElementById('plannerStatus'),
            validator: document.getElementById('validatorStatus'),
            advisor: document.getElementById('advisorStatus')
        };
        
        // Tab elements
        this.tabs = document.querySelectorAll('.tab');
        this.tabPanes = {
            planner: document.getElementById('plannerTab'),
            validator: document.getElementById('validatorTab'),
            advisor: document.getElementById('advisorTab'),
            summary: document.getElementById('summaryTab')
        };
        
        // Content containers
        this.contentContainers = {
            planner: document.getElementById('plannerContent'),
            validator: document.getElementById('validatorContent'),
            advisor: document.getElementById('advisorContent'),
            summary: document.getElementById('summaryContent')
        };
        
        // Modal
        this.aboutModal = document.getElementById('aboutModal');
        this.aboutBtn = document.getElementById('aboutBtn');
        this.closeModal = document.querySelector('.close-modal');
        
        // Export buttons
        this.exportPlanBtn = document.getElementById('exportPlanBtn');
        this.exportSummaryBtn = document.getElementById('exportSummaryBtn');
        
        this.startTime = null;
        this.timerInterval = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupDemoTasks();
    }
    
    setupEventListeners() {
        // Task input character count
        this.taskInput.addEventListener('input', () => {
            this.charCount.textContent = this.taskInput.value.length;
        });
        
        // Process task
        this.processBtn.addEventListener('click', () => this.processTask());
        
        // Reset
        this.resetBtn.addEventListener('click', () => this.resetUI());
        
        // Demo
        this.demoBtn.addEventListener('click', () => this.loadDemoTask());
        
        // Tabs
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target));
        });
        
        // Export buttons
        this.exportPlanBtn.addEventListener('click', () => this.exportPlan());
        this.exportSummaryBtn.addEventListener('click', () => this.exportSummary());
        
        // Modal
        this.aboutBtn.addEventListener('click', () => this.showModal());
        this.closeModal.addEventListener('click', () => this.hideModal());
        this.aboutModal.addEventListener('click', (e) => {
            if (e.target === this.aboutModal) this.hideModal();
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideModal();
        });
        
        // Docs button
        document.getElementById('docsBtn').addEventListener('click', () => {
            window.open('https://www.ibm.com/products/watsonx-orchestrate', '_blank');
        });
    }
    
    setupDemoTasks() {
        this.demoTasks = [
            "Create a comprehensive marketing strategy for launching a new eco-friendly smartphone in the European market. Include target audience analysis, channel selection, budget allocation, and KPIs for measuring success.",
            "Develop a full-stack web application for a university library management system. Include user authentication, book catalog management, borrowing/returning functionality, late fee calculation, and reporting features.",
            "Design a 6-month employee training program for a mid-sized tech company transitioning to cloud-native development. Include curriculum, assessment methods, resource requirements, and success metrics.",
            "Plan a sustainable city initiative focusing on reducing carbon footprint through smart technology integration, renewable energy adoption, and community engagement programs."
        ];
    }
    
    async processTask() {
        const task = this.taskInput.value.trim();
        const complexity = this.complexitySelect.value;
        
        if (!task) {
            this.showNotification('Please enter a task description', 'error');
            return;
        }
        
        if (task.length < 10) {
            this.showNotification('Please provide a more detailed task description', 'warning');
            return;
        }
        
        // Reset UI and start orchestration
        this.resetUI();
        this.startOrchestration();
        
        try {
            // Show processing state
            this.setProcessingState(true);
            
            // Start timer
            this.startTime = Date.now();
            this.startTimer();
            
            // Step 1: Planning
            await this.updateStatus('planner', 'processing');
            const plan = await this.callAgent('planner', { task, complexity });
            this.displayPlan(plan);
            await this.updateStatus('planner', 'completed');
            await this.updateProgress(33);
            
            // Step 2: Validation
            await this.updateStatus('validator', 'processing');
            const validation = await this.callAgent('validator', { task, plan });
            this.displayValidation(validation);
            await this.updateStatus('validator', 'completed');
            await this.updateProgress(66);
            
            // Step 3: Advice
            await this.updateStatus('advisor', 'processing');
            const advice = await this.callAgent('advisor', { task, plan, validation });
            this.displayAdvice(advice);
            await this.updateStatus('advisor', 'completed');
            await this.updateProgress(100);
            
            // Generate summary
            this.displaySummary(task, complexity, plan, validation, advice);
            
            // Show success notification
            this.showNotification('Task orchestration completed successfully!', 'success');
            
        } catch (error) {
            console.error('Orchestration error:', error);
            this.showNotification('Failed to process task. Please try again.', 'error');
            this.setProcessingState(false);
            this.stopTimer();
        } finally {
            this.setProcessingState(false);
            this.stopTimer();
        }
    }
    
    async callAgent(agent, data) {
        // In production, this would call the actual API
        // For the hackathon demo, we'll simulate the API call
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const response = this.simulateAgentResponse(agent, data);
                resolve(response);
            }, 1500);
        });
    }
    
    simulateAgentResponse(agent, data) {
        const { task, complexity } = data;
        
        switch (agent) {
            case 'planner':
                return this.simulatePlannerResponse(task, complexity);
            case 'validator':
                return this.simulateValidatorResponse(data.plan);
            case 'advisor':
                return this.simulateAdvisorResponse(data);
            default:
                return {};
        }
    }
    
    simulatePlannerResponse(task, complexity) {
        const steps = [
            {
                id: 1,
                title: "Task Analysis & Requirements Gathering",
                description: "Analyze the task requirements and identify key objectives, constraints, and success criteria. Break down the task into manageable components.",
                duration: "1-2 hours",
                resources: ["Stakeholder Input", "Requirements Document", "SWOT Analysis"]
            },
            {
                id: 2,
                title: "Research & Market Analysis",
                description: "Conduct thorough research on similar projects, market trends, and competitor analysis. Gather data and insights to inform strategy.",
                duration: "3-4 hours",
                resources: ["Market Research Tools", "Competitor Analysis", "Industry Reports"]
            },
            {
                id: 3,
                title: "Strategy Development",
                description: "Develop comprehensive strategy including approach, methodology, and implementation plan. Define milestones and deliverables.",
                duration: "2-3 hours",
                resources: ["Strategy Framework", "Project Management Tools", "Timeline Template"]
            },
            {
                id: 4,
                title: "Resource Planning & Allocation",
                description: "Identify required resources including team members, tools, budget, and timeline. Create resource allocation plan.",
                duration: "1-2 hours",
                resources: ["Resource Management Tools", "Budget Template", "Team Roster"]
            },
            {
                id: 5,
                title: "Risk Assessment & Mitigation",
                description: "Identify potential risks and challenges. Develop mitigation strategies and contingency plans.",
                duration: "1-2 hours",
                resources: ["Risk Assessment Matrix", "Contingency Plan Template", "Stakeholder Feedback"]
            },
            {
                id: 6,
                title: "Implementation Roadmap",
                description: "Create detailed implementation roadmap with phases, milestones, and success metrics. Define roles and responsibilities.",
                duration: "2-3 hours",
                resources: ["Project Roadmap Template", "Gantt Chart", "Communication Plan"]
            }
        ];
        
        // Adjust based on complexity
        if (complexity === 'simple') {
            return steps.slice(0, 3);
        } else if (complexity === 'medium') {
            return steps.slice(0, 5);
        }
        
        return steps;
    }
    
    simulateValidatorResponse(plan) {
        const validations = [
            {
                id: 1,
                type: "passed",
                title: "Task Feasibility",
                message: "The task is well-defined and achievable within reasonable constraints."
            },
            {
                id: 2,
                type: "warning",
                title: "Resource Availability",
                message: "Some specialized resources may require additional allocation or outsourcing."
            },
            {
                id: 3,
                type: "passed",
                title: "Timeline Realism",
                message: "Proposed timeline is realistic and accounts for potential delays."
            },
            {
                id: 4,
                type: "warning",
                title: "Risk Management",
                message: "Additional risk mitigation strategies recommended for high-impact risks."
            },
            {
                id: 5,
                type: "passed",
                title: "Success Metrics",
                message: "Clear success metrics defined for measuring progress and outcomes."
            }
        ];
        
        return validations;
    }
    
    simulateAdvisorResponse(data) {
        const advice = [
            {
                id: 1,
                type: "strategy",
                title: "Agile Implementation Approach",
                content: "Consider adopting an agile methodology with 2-week sprints for better adaptability and faster feedback cycles."
            },
            {
                id: 2,
                type: "technology",
                title: "Leverage Cloud-Native Tools",
                content: "Utilize cloud-native development tools and platforms for scalability and reduced infrastructure management overhead."
            },
            {
                id: 3,
                type: "team",
                title: "Cross-Functional Team Structure",
                content: "Organize team members into cross-functional squads to improve collaboration and reduce dependencies."
            },
            {
                id: 4,
                type: "communication",
                title: "Stakeholder Communication Plan",
                content: "Implement regular stakeholder check-ins and progress reports to maintain alignment and manage expectations."
            }
        ];
        
        return advice;
    }
    
    displayPlan(plan) {
        const container = this.contentContainers.planner;
        container.innerHTML = '';
        
        plan.forEach(step => {
            const stepElement = document.createElement('div');
            stepElement.className = 'step-container';
            stepElement.innerHTML = `
                <div class="step-header">
                    <div class="step-number">${step.id}</div>
                    <div class="step-title">${step.title}</div>
                    <div class="step-duration">${step.duration}</div>
                </div>
                <div class="step-details">
                    <p class="step-description">${step.description}</p>
                    <div class="step-resources">
                        ${step.resources.map(resource => 
                            `<span class="resource-tag">
                                <i class="fas fa-tag"></i> ${resource}
                            </span>`
                        ).join('')}
                    </div>
                </div>
            `;
            container.appendChild(stepElement);
        });
        
        // Switch to planner tab
        this.switchTab(document.querySelector('[data-tab="planner"]'));
    }
    
    displayValidation(validations) {
        const container = this.contentContainers.validator;
        container.innerHTML = '';
        
        validations.forEach(validation => {
            const validationElement = document.createElement('div');
            validationElement.className = `validation-item ${validation.type}`;
            validationElement.innerHTML = `
                <div class="validation-header">
                    <i class="fas fa-${validation.type === 'passed' ? 'check-circle' : 
                                       validation.type === 'warning' ? 'exclamation-triangle' : 
                                       'times-circle'} validation-icon"></i>
                    <div class="validation-title">${validation.title}</div>
                </div>
                <div class="validation-message">${validation.message}</div>
            `;
            container.appendChild(validationElement);
        });
    }
    
    displayAdvice(advice) {
        const container = this.contentContainers.advisor;
        container.innerHTML = '';
        
        advice.forEach(item => {
            const adviceElement = document.createElement('div');
            adviceElement.className = 'advice-card';
            adviceElement.innerHTML = `
                <div class="advice-header">
                    <div class="advice-icon">
                        <i class="fas fa-${item.type === 'strategy' ? 'chess' : 
                                         item.type === 'technology' ? 'microchip' : 
                                         item.type === 'team' ? 'users' : 
                                         'comments'}"></i>
                    </div>
                    <div class="advice-title">${item.title}</div>
                </div>
                <div class="advice-content">
                    <p>${item.content}</p>
                    <ul class="tips-list">
                        <li>Consider conducting regular review sessions</li>
                        <li>Document decisions and rationale</li>
                        <li>Establish clear success metrics</li>
                    </ul>
                </div>
            `;
            container.appendChild(adviceElement);
        });
    }
    
    displaySummary(task, complexity, plan, validation, advice) {
        const container = this.contentContainers.summary;
        
        const passedValidations = validation.filter(v => v.type === 'passed').length;
        const warningValidations = validation.filter(v => v.type === 'warning').length;
        
        container.innerHTML = `
            <div class="summary-grid">
                <div class="summary-card">
                    <h4>Task Complexity</h4>
                    <div class="summary-value">${complexity.charAt(0).toUpperCase() + complexity.slice(1)}</div>
                </div>
                <div class="summary-card">
                    <h4>Total Steps</h4>
                    <div class="summary-value">${plan.length}</div>
                </div>
                <div class="summary-card">
                    <h4>Validations Passed</h4>
                    <div class="summary-value">${passedValidations}/${validation.length}</div>
                </div>
                <div class="summary-card">
                    <h4>Expert Advice</h4>
                    <div class="summary-value">${advice.length}</div>
                </div>
            </div>
            
            <div class="summary-chart">
                <div class="chart-placeholder">
                    <i class="fas fa-chart-bar"></i>
                    <span>Orchestration Analytics Visualization</span>
                </div>
            </div>
            
            <div class="summary-recommendations">
                <h4><i class="fas fa-lightbulb"></i> Key Recommendations</h4>
                <p>Based on the analysis, here are the key recommendations:</p>
                <ul class="tips-list">
                    <li>Start with Phase 1 of the implementation plan for quick wins</li>
                    <li>Allocate additional resources for high-risk areas identified</li>
                    <li>Schedule weekly review meetings to track progress</li>
                    <li>Consider implementing agile methodologies for flexibility</li>
                </ul>
            </div>
        `;
    }
    
    updateStatus(agent, status) {
        return new Promise(resolve => {
            const element = this.statusItems[agent];
            element.classList.remove('active', 'completed', 'processing');
            
            if (status === 'processing') {
                element.classList.add('processing');
                setTimeout(() => {
                    element.classList.add('active');
                    resolve();
                }, 300);
            } else if (status === 'completed') {
                element.classList.add('completed');
                setTimeout(resolve, 500);
            }
        });
    }
    
    updateProgress(percentage) {
        return new Promise(resolve => {
            this.progressFill.style.width = `${percentage}%`;
            setTimeout(resolve, 300);
        });
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.executionTime.textContent = 
                `Execution time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
    
    startOrchestration() {
        // Reset all status indicators
        Object.values(this.statusItems).forEach(item => {
            item.classList.remove('active', 'completed', 'processing');
        });
        
        // Reset progress bar
        this.progressFill.style.width = '0%';
        
        // Clear all content containers
        Object.values(this.contentContainers).forEach(container => {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="spinner"></div>
                    <p>Processing...</p>
                </div>
            `;
        });
    }
    
    setProcessingState(isProcessing) {
        if (isProcessing) {
            this.processBtn.disabled = true;
            this.processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            this.taskInput.disabled = true;
            this.complexitySelect.disabled = true;
        } else {
            this.processBtn.disabled = false;
            this.processBtn.innerHTML = '<i class="fas fa-play-circle"></i> Orchestrate Task';
            this.taskInput.disabled = false;
            this.complexitySelect.disabled = false;
        }
    }
    
    resetUI() {
        // Reset input
        this.taskInput.value = '';
        this.charCount.textContent = '0';
        this.complexitySelect.value = 'medium';
        
        // Reset status
        Object.values(this.statusItems).forEach(item => {
            item.classList.remove('active', 'completed', 'processing');
        });
        
        // Reset progress
        this.progressFill.style.width = '0%';
        this.executionTime.textContent = 'Execution time: --:--';
        
        // Reset content containers
        Object.values(this.contentContainers).forEach(container => {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-${container.id.includes('planner') ? 'brain' : 
                                       container.id.includes('validator') ? 'clipboard-check' : 
                                       container.id.includes('advisor') ? 'comments' : 
                                       'chart-bar'}"></i>
                    <p>${container.id.includes('planner') ? 'Your task breakdown will appear here' : 
                         container.id.includes('validator') ? 'Validation results will appear here' : 
                         container.id.includes('advisor') ? 'Expert advice will appear here' : 
                         'Summary will appear here after orchestration'}</p>
                </div>
            `;
        });
        
        // Switch to planner tab
        this.switchTab(document.querySelector('[data-tab="planner"]'));
        
        // Stop timer
        this.stopTimer();
        
        this.showNotification('UI has been reset', 'info');
    }
    
    loadDemoTask() {
        const randomTask = this.demoTasks[Math.floor(Math.random() * this.demoTasks.length)];
        this.taskInput.value = randomTask;
        this.charCount.textContent = randomTask.length;
        this.showNotification('Demo task loaded. Click "Orchestrate Task" to process.', 'info');
    }
    
    switchTab(tabElement) {
        // Update tab buttons
        this.tabs.forEach(t => t.classList.remove('active'));
        tabElement.classList.add('active');
        
        // Update tab panes
        const tabName = tabElement.getAttribute('data-tab');
        Object.values(this.tabPanes).forEach(pane => pane.classList.remove('active'));
        this.tabPanes[tabName].classList.add('active');
    }
    
    exportPlan() {
        const planContent = this.contentContainers.planner.innerHTML;
        if (planContent.includes('empty-state')) {
            this.showNotification('No plan to export', 'warning');
            return;
        }
        
        const blob = new Blob([`<html><body>${planContent}</body></html>`], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'task-plan.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Plan exported successfully', 'success');
    }
    
    exportSummary() {
        const summaryContent = this.contentContainers.summary.innerHTML;
        if (summaryContent.includes('empty-state')) {
            this.showNotification('No summary to export', 'warning');
            return;
        }
        
        const blob = new Blob([`<html><body>${summaryContent}</body></html>`], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orchestration-summary.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Summary exported successfully', 'success');
    }
    
    showNotification(message, type) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                               type === 'error' ? 'times-circle' : 
                               type === 'warning' ? 'exclamation-triangle' : 
                               'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 24px;
                border-radius: var(--border-radius);
                color: white;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 1000;
                animation: slideIn 0.3s ease;
                box-shadow: var(--shadow-lg);
                max-width: 400px;
            }
            
            .notification-success {
                background: linear-gradient(135deg, #28a745, #218838);
            }
            
            .notification-error {
                background: linear-gradient(135deg, #dc3545, #c82333);
            }
            
            .notification-warning {
                background: linear-gradient(135deg, #ffc107, #e0a800);
            }
            
            .notification-info {
                background: linear-gradient(135deg, #17a2b8, #138496);
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        
        document.head.appendChild(styles);
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    showModal() {
        this.aboutModal.classList.add('active');
    }
    
    hideModal() {
        this.aboutModal.classList.remove('active');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AITaskOrchestrator();
});
