f1: (boxElement) => {
        if (!boxElement) return;
        
        const isActive = boxElement.classList.toggle('active');
        const toggleBtn = boxElement.querySelector('.toggle-btn');
        
        // बटन की स्थिति बदलना
        if (isActive) {
            if (toggleBtn) toggleBtn.innerHTML = '🛑 आवाज़ बंद करें';
        } else {
            if (toggleBtn) toggleBtn.innerHTML = '🔊 बोलकर सुनें';
            window.speechSynthesis.cancel();
            // हाईलाइट साफ करना
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

        // आवाज़ और लाइव हाईलाइटर का मास्टर जुगाड़
        const runSpeechEngine = () => {
            // आपके ब्लॉगर पोस्ट का मुख्य हिस्सा ढूंढने के सभी संभावित रास्ते
            const postArea = document.querySelector('.post-body') || 
                             document.querySelector('.entry-content') || 
                             document.querySelector('article') || 
                             document.querySelector('.post');
            
            if (!postArea) {
                console.log("पोस्ट एरिया नहीं मिला!");
                return;
            }

            // सारे पैराग्राफ निकालना (खाली पैराग्राफ छोड़कर)
            const paragraphs = Array.from(postArea.querySelectorAll('p, div')).filter(el => {
                return el.textContent.trim().length > 10 && !el.querySelector('script') && !el.querySelector('style');
            });

            if (paragraphs.length === 0) {
                console.log("कोई पढ़ने लायक पैराग्राफ नहीं मिला!");
                return;
            }

            // सारा टेक्स्ट इकट्ठा करना
            let fullText = paragraphs.map(p => p.textContent.trim()).join(" [ब्रेक] ");

            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(fullText);
            utterance.lang = 'hi-IN'; // हिंदी उच्चारण
            utterance.rate = 0.95;    // सुनने में अच्छी स्पीड

            // लाइव शब्द हाइलाइटर का नया लॉजिक
            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    const charIndex = event.charIndex;
                    let accumulatedLength = 0;

                    for (let i = 0; i < paragraphs.length; i++) {
                        const pText = paragraphs[i].textContent.trim();
                        const pLengthWithBreak = pText.length + 9; // "[ब्रेक] " की लंबाई जोड़कर

                        if (charIndex >= accumulatedLength && charIndex < accumulatedLength + pLengthWithBreak) {
                            const relativeIndex = charIndex - accumulatedLength;
                            
                            // शब्द को तोड़कर हाइलाइट लगाना
                            const before = pText.slice(0, relativeIndex);
                            const word = pText.slice(relativeIndex).split(/[\s,.\u0964]+/)[0];
                            const after = pText.slice(relativeIndex + word.length);

                            if (word.length > 0) {
                                paragraphs[i].innerHTML = `${before}<mark class="f1-highlight" style="background-color: #22c55e; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: bold; box-shadow: 0 2px 5px rgba(34,197,94,0.3);">${word}</mark>${after}`;
                            }
                            break;
                        }
                        accumulatedLength += pLengthWithBreak;
                    }
                }
            };

            utterance.onend = () => {
                boxElement.classList.remove('active');
                if (toggleBtn) toggleBtn.innerHTML = '🔊 बोलकर सुनें';
                paragraphs.forEach(p => p.innerHTML = p.textContent);
            };

            window.speechSynthesis.speak(utterance);
        };

        runSpeechEngine();
    },
