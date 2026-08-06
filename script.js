/* ==========================================================================
   KAIROSAI INVESTOR PITCH DECK ENGINE (1920x1080 Interactive Presenter)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    let currentSlide = 1;
    const totalSlides = 10;

    const presentation = document.getElementById('presentation');
    const currentSlideNumEl = document.getElementById('current-slide-num');
    const progressFillEl = document.getElementById('progress-fill');
    const thumbnailStripEl = document.getElementById('thumbnail-strip');
    const speakerNotesModal = document.getElementById('speaker-notes-modal');
    const notesContentEl = document.getElementById('notes-content');
    const notesSlideNumEl = document.getElementById('notes-slide-num');
    const overviewOverlay = document.getElementById('overview-overlay');
    const overviewGridEl = document.getElementById('overview-grid');

    // Slide Titles and Speaker Notes Database
    const slideData = [
        {
            title: "Title & Cover Vision",
            notes: `<strong>Elevator Pitch (60s):</strong> "KairosAI is an intelligent network threat detection and analysis tool tailored for small organizations and educational institutions. By combining traditional packet monitoring with machine learning and large language models, it detects anomalies in real time and explains them in plain English."<br><br><strong>Key Talking Points:</strong><br>• Introduce team roles: XYZ (Backend Lead), ABC (Frontend/UI), DEF (AI/ML Specialist), GHI (QA & Docs).<br>• Emphasize the core value: Democratizing enterprise security for underserved SMBs.`
        },
        {
            title: "Urgent SMB Crisis",
            notes: `<strong>Key Talking Points:</strong><br>• 43% of cyberattacks hit SMBs, yet 80% of ransomware focuses on companies <1,000 employees.<br>• Attack breakout time inside networks is down to 48 minutes.<br>• 79% of intrusions are malware-free (credential theft/living-off-the-land) that static firewalls miss.<br><br><strong>Investor Q&A Cue:</strong> <em>"Why focus on SMBs?"</em> SMBs are disproportionately targeted and cannot afford $150k+ SOC teams.`
        },
        {
            title: "The KairosAI Solution",
            notes: `<strong>Key Talking Points:</strong><br>• Walk through the 4 pillars: Sniffing → Dual ML → LLM XAI → React Dashboard.<br>• Random Forest handles tabular flow features with 99%+ accuracy.<br>• Isolation Forest catches zero-day novel anomalies without signatures.<br>• Llama 3 via Ollama translates tech alerts into plain-English mitigation advice.`
        },
        {
            title: "Market Opportunity",
            notes: `<strong>Key Talking Points:</strong><br>• TAM: $50.2B Global SMB Cybersecurity Market.<br>• SAM: $12.4B SMB Network Intrusion & Threat Detection.<br>• SOM: $450M Target initial focus in Higher-Ed labs, MSP partners, and high-risk SMBs.<br>• Highlight channel scalability with MSP partners managing multiple SMB clients.`
        },
        {
            title: "System Architecture",
            notes: `<strong>Key Talking Points:</strong><br>• Walk step-by-step through packet capture to dashboard.<br>• Fast metadata extraction avoids PII privacy risks.<br>• Async FastAPI backend ensures real-time low-latency flow scoring.`
        },
        {
            title: "Product Capabilities",
            notes: `<strong>Key Talking Points:</strong><br>• Demo the Live Threat Monitor UI snippet.<br>• Highlight <1ms ML inference latency.<br>• Explainability prevents alarm fatigue: non-experts understand *why* an alert fired and *what* action to take.`
        },
        {
            title: "Competitive Landscape",
            notes: `<strong>Key Talking Points:</strong><br>• Compare KairosAI with Zeek/Snort, Splunk/CrowdStrike, and Darktrace.<br>• Key differentiators: Built-in natural language XAI, <15 minute plug-and-play setup, <$3,600/yr TCO.`
        },
        {
            title: "Business Model",
            notes: `<strong>Key Talking Points:</strong><br>• Community Sensor ($0) drives open-source bottom-up virality.<br>• Pro SMB ($299/mo/site) drives predictable recurring SaaS revenue.<br>• MSP Partner Portal ($999/mo) unlocks high-margin multi-tenant scale.`
        },
        {
            title: "Team & Roadmap",
            notes: `<strong>Key Talking Points:</strong><br>• Highlight team balance across Systems, UI/UX, AI/ML, and Security QA.<br>• Walk through 12-month roadmap: Q1 MVP → Q2 SMB Beta → Q3 MSP Launch → Q4 Zero-Trust & Edge AI.`
        },
        {
            title: "Financial Ask & Vision",
            notes: `<strong>Key Talking Points:</strong><br>• Asking for $750,000 Seed Funding (18-Month Runway).<br>• 50% Engineering/AI, 30% GTM & MSP Sales, 20% Security Compliance & Operations.<br>• Ultimate Vision: Standard AI Security Analyst for 1M+ SMBs worldwide.`
        }
    ];

    /* ----------------------------------------------------------------------
       1. Viewport Scaling Engine (Fits 1920x1080 to any window size)
       ---------------------------------------------------------------------- */
    function scalePresentation() {
        const wrapper = document.querySelector('.viewport-wrapper');
        if (!wrapper || !presentation) return;

        const windowWidth = wrapper.clientWidth - 40; // padding adjustment
        const windowHeight = wrapper.clientHeight - 40;

        const scaleX = windowWidth / 1920;
        const scaleY = windowHeight / 1080;

        const scale = Math.min(scaleX, scaleY, 1); // cap at 1.0 scale

        presentation.style.transform = `scale(${scale})`;
    }

    window.addEventListener('resize', scalePresentation);
    scalePresentation();

    /* ----------------------------------------------------------------------
       2. Slide Navigation Logic
       ---------------------------------------------------------------------- */
    function goToSlide(n) {
        if (n < 1) n = 1;
        if (n > totalSlides) n = totalSlides;

        // Hide all slides
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
        });

        // Show target slide
        const targetSlide = document.getElementById(`slide-${n}`);
        if (targetSlide) {
            targetSlide.classList.add('active');
        }

        currentSlide = n;

        // Update UI counters
        if (currentSlideNumEl) currentSlideNumEl.textContent = currentSlide;
        if (progressFillEl) progressFillEl.style.width = `${(currentSlide / totalSlides) * 100}%`;

        // Update Thumbnail active state
        document.querySelectorAll('.thumb-item').forEach((thumb, idx) => {
            if (idx + 1 === currentSlide) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });

        // Update Speaker Notes content
        if (notesContentEl && notesSlideNumEl) {
            notesSlideNumEl.textContent = currentSlide;
            notesContentEl.innerHTML = slideData[currentSlide - 1].notes;
        }

        // Trigger chart animation if present
        if (currentSlide === 2 && !window.chartProblemInitialized) {
            initChartProblem();
        }
        if (currentSlide === 10 && !window.chartAskInitialized) {
            initChartAsk();
        }
    }

    // Controls Event Listeners
    document.getElementById('btn-prev')?.addEventListener('click', () => goToSlide(currentSlide - 1));
    document.getElementById('btn-next')?.addEventListener('click', () => goToSlide(currentSlide + 1));
    document.getElementById('btn-first')?.addEventListener('click', () => goToSlide(1));
    document.getElementById('btn-last')?.addEventListener('click', () => goToSlide(totalSlides));

    /* ----------------------------------------------------------------------
       3. Keyboard Controls
       ---------------------------------------------------------------------- */
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                goToSlide(currentSlide + 1);
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                goToSlide(currentSlide - 1);
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides);
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
            case 'n':
            case 'N':
                toggleSpeakerNotes();
                break;
            case 'm':
            case 'M':
                toggleOverview();
                break;
            case 'p':
            case 'P':
                window.print();
                break;
        }
    });

    /* ----------------------------------------------------------------------
       4. Speaker Notes & Overview Modals
       ---------------------------------------------------------------------- */
    function toggleSpeakerNotes() {
        if (speakerNotesModal) {
            speakerNotesModal.classList.toggle('active');
        }
    }

    function toggleOverview() {
        if (overviewOverlay) {
            overviewOverlay.classList.toggle('active');
        }
    }

    document.getElementById('btn-notes')?.addEventListener('click', toggleSpeakerNotes);
    document.getElementById('close-notes-btn')?.addEventListener('click', toggleSpeakerNotes);

    document.getElementById('btn-overview')?.addEventListener('click', toggleOverview);
    document.getElementById('close-overview-btn')?.addEventListener('click', toggleOverview);

    document.getElementById('btn-fullscreen')?.addEventListener('click', toggleFullscreen);
    document.getElementById('btn-print')?.addEventListener('click', () => window.print());

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    /* ----------------------------------------------------------------------
       5. Render Thumbnail Strip & Overview Grid
       ---------------------------------------------------------------------- */
    function renderThumbnailsAndOverview() {
        if (thumbnailStripEl) {
            thumbnailStripEl.innerHTML = '';
            for (let i = 1; i <= totalSlides; i++) {
                const thumb = document.createElement('div');
                thumb.className = `thumb-item ${i === 1 ? 'active' : ''}`;
                thumb.textContent = i;
                thumb.title = slideData[i - 1].title;
                thumb.addEventListener('click', () => goToSlide(i));
                thumbnailStripEl.appendChild(thumb);
            }
        }

        if (overviewGridEl) {
            overviewGridEl.innerHTML = '';
            for (let i = 1; i <= totalSlides; i++) {
                const card = document.createElement('div');
                card.className = 'overview-card';
                card.innerHTML = `
                    <span class="overview-num">SLIDE ${i}</span>
                    <h4 class="overview-title">${slideData[i - 1].title}</h4>
                `;
                card.addEventListener('click', () => {
                    goToSlide(i);
                    toggleOverview();
                });
                overviewGridEl.appendChild(card);
            }
        }
    }

    renderThumbnailsAndOverview();

    /* ----------------------------------------------------------------------
       6. Chart.js Data Visualizations
       ---------------------------------------------------------------------- */
    function initChartProblem() {
        const ctx = document.getElementById('chart-problem')?.getContext('2d');
        if (!ctx) return;

        window.chartProblemInitialized = true;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Targeted Attacks (SMBs)', 'Ransomware (<1k Empl)', 'Malware-Free Intrusions', 'AI Phishing Click-Rate'],
                datasets: [{
                    label: 'Impact Percentage (%)',
                    data: [43, 80, 79, 54],
                    backgroundColor: [
                        '#e11d48',
                        '#d97706',
                        '#0284c7',
                        '#4f46e5'
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => value + '%'
                        }
                    }
                }
            }
        });
    }

    function initChartAsk() {
        const ctx = document.getElementById('chart-ask')?.getContext('2d');
        if (!ctx) return;

        window.chartAskInitialized = true;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['R&D & AI Engineering (50%)', 'GTM & MSP Sales (30%)', 'Security & Compliance (20%)'],
                datasets: [{
                    data: [375000, 225000, 150000],
                    backgroundColor: [
                        '#0284c7',
                        '#059669',
                        '#d97706'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: 'Inter', size: 13 }
                        }
                    }
                }
            }
        });
    }

    // Initialize first slide
    goToSlide(1);
});
