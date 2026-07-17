window.FeatureRegistry = {
    f25: (boxElement) => {
        console.log("Feature f25 सक्रिय हो गया है!");
        const wrapper = document.createElement("div");
        wrapper.innerHTML = "<h2 style='color:green;'>पेमेंट इंजन सफलतापूर्वक लोड हुआ!</h2>";
        boxElement.appendChild(wrapper);
    }
};
