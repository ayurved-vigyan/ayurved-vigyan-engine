f1: (boxElement) => {
        if (!boxElement) return;
        
        // 1. स्टेट टॉगल (Active/Inactive Class)
        const isActive = boxElement.classList.toggle('active');
        const toggleBtn = boxElement.querySelector('.toggle-btn');
        
        // बटन के टेक्स्ट और स्टेट को बदलना
        if (isActive) {
            if (toggleBtn) toggleBtn.innerHTML = '🔊 बंद करें';
        } else {
            if (toggleBtn) toggleBtn.innerHTML = '🔈 चालू करें';
            // अगर बंद किया तो आवाज तुरंत रोकें और हाईलाइट साफ करें
            window.speechSynthesis.cancel();
            const highlightedElements = document.querySelectorAll('.f1-highlight');
            highlightedElements.forEach(el => {
                const parent = el.parentNode;
                if (parent) {
                    parent.replaceChild(document.createTextNode(el.textContent), el);
                    parent.normalize();
                }
            });
            return;
        }

        // 2. सेल्फ-कंटेन्ड मुख्य स्पीच लॉजिक
        const startTextToSpeech = () => {
            // मुख्य पोस्ट का टेक्स्ट ढूंढना (.post-body)
            const postBody = document.querySelector('.post-body') || document.querySelector('article') || document.body;
            if (!postBody) return;

            // सिर्फ शुद्ध टेक्स्ट पैराग्राफ्स को पकड़ना (इमेज या फालतू स्क्रिप्ट्स को छोड़कर)
            const paragraphs = postBody.querySelectorAll('p');
            if (paragraphs.length === 0) return;

            let fullText = "";
            paragraphs.forEach(p => {
                fullText += p.textContent + " ";
            });

            // अगर ब्राउज़र में पहले से कुछ चल रहा है तो उसे रोकें
            window.speechSynthesis.cancel();

            // नया Utterance ऑब्जेक्ट (हिंदी भाषा के लिए)
            const utterance = new SpeechSynthesisUtterance(fullText.trim());
            utterance.lang = 'hi-IN'; // शुद्ध हिंदी उच्चारण
            utterance.rate = 1.0;     // सामान्य स्पीड

            // 3. लाइव वर्ड हाइलाइटर लॉजिक (Highlighter with Speech)
            // पैराग्राफ के टेक्स्ट को टुकड़ों में बांटकर हाइलाइट करने की व्यवस्था
            let paragraphIndex = 0;
            let currentParagraph = paragraphs[paragraphIndex];
            let originalHTML = currentParagraph.innerHTML;

            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    const charIndex = event.charIndex;
                    const textSoFar = fullText.slice(0, charIndex);
                    
                    // यह पता लगाना कि अभी हम किस पैराग्राफ के कौन से शब्द पर हैं
                    let currentLength = 0;
                    for (let i = 0; i < paragraphs.length; i++) {
                        const pText = paragraphs[i].textContent + " ";
                        if (charIndex >= currentLength && charIndex < currentLength + pText.length) {
                            if (paragraphs[i] !== currentParagraph) {
                                // पुराने पैराग्राफ का ओरिजिनल टेक्स्ट वापस करना
                                currentParagraph.innerHTML = originalHTML;
                                currentParagraph = paragraphs[i];
                                originalHTML = currentParagraph.innerHTML;
                            }
                            
                            const relativeIndex = charIndex - currentLength;
                            const textBefore = currentParagraph.textContent.slice(0, relativeIndex);
                            const currentWord = currentParagraph.textContent.slice(relativeIndex).split(/\s+/)[0];
                            const textAfter = currentParagraph.textContent.slice(relativeIndex + currentWord.length);

                            // पीले रंग की सुंदर हाइलाइटिंग (Yellow/Soft Highlight)
                            currentParagraph.innerHTML = `${textBefore}<mark class="f1-highlight" style="background-color: #fef08a; color: #1e293b; padding: 2px 4px; border-radius: 4px; font-weight: bold; transition: all 0.2s ease;">${currentWord}</mark>${textAfter}`;
                            break;
                        }
                        currentLength += pText.length;
                    }
                }
            };

            // पढ़ना खत्म होने पर या बंद करने पर सफाई
            utterance.onend = () => {
                boxElement.classList.remove('active');
                if (toggleBtn) toggleBtn.innerHTML = '🔈 चालू करें';
                paragraphs.forEach((p, idx) => {
                    // सभी पैराग्राफ को सामान्य कर देना
                    p.innerHTML = p.textContent;
                });
            };

            // बोलना शुरू करें!
            window.speechSynthesis.speak(utterance);
        };

        startTextToSpeech();
    },
