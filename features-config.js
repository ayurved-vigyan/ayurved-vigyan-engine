f1: (boxElement) => {
        if (!boxElement) return;
        
        const isActive = boxElement.classList.toggle('active');
        const toggleBtn = boxElement.querySelector('.toggle-btn');
        
        if (isActive) {
            if (toggleBtn) toggleBtn.innerHTML = '🛑 आवाज़ बंद करें';
        } else {
            if (toggleBtn) toggleBtn.innerHTML = '🔊 बोलकर सुनें';
            window.speechSynthesis.cancel();
            const highlighted = document.querySelectorAll('.f1-highlight');
            highlighted.forEach(el => {
                const parent = el.parentNode;
                if (parent) {
                    parent.replaceChild(document.createTextNode(el.textContent), el);
                    parent.normalize();
                }
            });
            return;
        }

        const runSpeechEngine = () => {
            // आपके ब्लॉगर पोस्ट का मुख्य हिस्सा ढूंढने का सबसे अचूक तरीका
            const postArea = document.querySelector('.post-body') || 
                             document.querySelector('.entry-content') || 
                             document.querySelector('article') || 
                             document.getElementById('post-body') ||
                             document.body;
            
            if (!postArea) {
                console.log("पोस्ट एरिया नहीं मिला!");
                return;
            }

            // सारे टेक्स्ट एलिमेंट्स निकालना (p, span, div जो खाली न हों)
            const elements = Array.from(postArea.querySelectorAll('p, span, div')).filter(el => {
                // विजेट के खुद के टेक्स्ट को बाहर रखना ताकि वह खुद का नाम न पढ़ने लगे
                return el.textContent.trim().length > 15 && 
                       !el.closest('.premium-speech-container') && 
                       !el.querySelector('script') && 
                       !el.querySelector('style');
            });

            if (elements.length === 0) {
                // अगर कोई पैराग्राफ नहीं मिला, तो सीधे पूरे पोस्ट एरिया का टेक्स्ट लें
                const directText = postArea.innerText || postArea.textContent;
                if (!directText) return;
                
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(directText.trim());
                utterance.lang = 'hi-IN';
                utterance.rate = 0.95;
                utterance.onend = () => {
                    boxElement.classList.remove('active');
                    if (toggleBtn) toggleBtn.innerHTML = '🔊 बोलकर सुनें';
                };
                window.speechSynthesis.speak(utterance);
                return;
            }

            let fullText = elements.map(el => el.textContent.trim()).join(" [break] ");

            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(fullText);
            utterance.lang = 'hi-IN';
            utterance.rate = 0.95;

            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    const charIndex = event.charIndex;
                    let accumulatedLength = 0;

                    for (let i = 0; i < elements.length; i++) {
                        const elText = elements[i].textContent.trim();
                        const elLengthWithBreak = elText.length + 9; // "[break] " की लंबाई

                        if (charIndex >= accumulatedLength && charIndex < accumulatedLength + elLengthWithBreak) {
                            const relativeIndex = charIndex - accumulatedLength;
                            
                            const before = elText.slice(0, relativeIndex);
                            const word = elText.slice(relativeIndex).split(/[\s,.\u0964]+/)[0];
                            const after = elText.slice(relativeIndex + word.length);

                            if (word.length > 0) {
                                elements[i].innerHTML = `${before}<mark class="f1-highlight" style="background-color: #22c55e; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: bold; box-shadow: 0 2px 5px rgba(34,197,94,0.3);">${word}</mark>${after}`;
                            }
                            break;
                        }
                        accumulatedLength += elLengthWithBreak;
                    }
                }
            };

            utterance.onend = () => {
                boxElement.classList.remove('active');
                if (toggleBtn) toggleBtn.innerHTML = '🔊 बोलकर सुनें';
                elements.forEach(el => el.innerHTML = el.textContent);
            };

            window.speechSynthesis.speak(utterance);
        };

        runSpeechEngine();
    },
