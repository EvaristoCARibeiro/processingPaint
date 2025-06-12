import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5'; // Make sure p5.js is available in your environment or loaded via CDN

// Main App component
const App = () => {
    // State to hold the sketch instance
    const [sketchInstance, setSketchInstance] = useState(null);
    // Ref to attach the p5.js canvas to
    const sketchRef = useRef();

    useEffect(() => {
        // Define the p5.js sketch function
        const sketch = (p) => {
            // Global variables for the paint app, accessible within the p5.js sketch instance
            let currentColor; // Current drawing color (p5.Color object)
            let currentSize; // Current stroke weight or dot size
            let currentMode; // 0: dotted, 1: solid

            // --- p5.js Setup Function ---
            // This function runs once when the sketch is initialized.
            p.setup = () => {
                // Get the width of the parent container to make the canvas responsive,
                // but cap it at 500px to match the original Processing size.
                const parentWidth = sketchRef.current.offsetWidth;
                p.createCanvas(p.min(500, parentWidth), 500).parent(sketchRef.current);
                p.background(255); // Set initial background to white

                // Initialize drawing variables
                currentColor = p.color(0); // Default color: Black
                currentSize = 1; // Default size for dots/lines
                currentMode = 0; // Default mode: dotted
            };

            // --- p5.js Draw Function ---
            // This function runs repeatedly (by default 60 times per second).
            p.draw = () => {
                // Use push() and pop() to isolate drawing settings for the info panel
                // from the main drawing actions (mouseDragged).
                p.push();
                p.stroke(0);        // Set stroke to black for the info box border
                p.strokeWeight(1);  // Set stroke weight to 1 for the info box border
                p.fill(150);        // Set fill to gray for the info box background
                // Draw the info box rectangle with a slight border radius
                p.rect(p.width - 120, 20, 100, 70, 8);

                p.textSize(14); // Set text size for info display
                p.fill(0);      // Set text color to black

                // Determine and display the current color name
                let colorName = "Unknown";
                // Compare p5.Color objects by converting them to string representations
                // This is a robust way to compare color objects in p5.js
                if (currentColor.toString() === p.color(0).toString()) {
                    colorName = "Black";
                } else if (currentColor.toString() === p.color(255, 0, 0).toString()) {
                    colorName = "Red";
                } else if (currentColor.toString() === p.color(0, 255, 0).toString()) {
                    colorName = "Green";
                } else if (currentColor.toString() === p.color(0, 0, 255).toString()) {
                    colorName = "Blue";
                }
                p.text(`Color: ${colorName}`, p.width - 110, 40);

                // Display the current stroke weight/dot size
                p.text(`Weight: ${currentSize}`, p.width - 110, 60);

                // Display the current drawing mode
                if (currentMode === 0) {
                    p.text("Mode: Dotted", p.width - 110, 80);
                } else if (currentMode === 1) {
                    p.text("Mode: Solid", p.width - 110, 80);
                }
                p.pop(); // Restore previous drawing settings (before this push() call)
            };

            // --- p5.js KeyPressed Function ---
            // This function is called once every time a key is pressed.
            p.keyPressed = () => {
                if (p.key === 'r') {
                    currentColor = p.color(255, 0, 0); // Set color to Red
                } else if (p.key === 'g') {
                    currentColor = p.color(0, 255, 0); // Set color to Green
                } else if (p.key === 'b') {
                    currentColor = p.color(0, 0, 255); // Set color to Blue
                } else if (p.key === 'd') {
                    currentMode = 0; // Set mode to Dotted
                } else if (p.key === 's') {
                    currentMode = 1; // Set mode to Solid
                } else if (p.keyCode >= 49 && p.keyCode <= 53) { // Check for number keys '1' through '5'
                    currentSize = p.keyCode - 48; // Convert ASCII keyCode to integer (e.g., 49 -> 1)
                } else if (p.key === 'c') {
                    p.background(255); // Clear the canvas to white
                } else if (p.key === 'v') {
                    p.saveCanvas('Screenshot', 'jpg'); // Save the current canvas as a JPG image
                } else {
                    console.log("Error: invalid key"); // Log invalid key presses to console
                }
            };

            // --- p5.js MouseDragged Function ---
            // This function is called when the mouse is dragged (pressed and moved).
            p.mouseDragged = () => {
                // Ensure drawing only happens if the mouse is within the canvas boundaries
                if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
                    if (currentMode === 0) { // Dotted mode: draw individual circles (dots)
                        p.noStroke(); // Dots should not have an outline
                        p.fill(currentColor); // Fill dots with the current drawing color
                        // The original `size` was stroke weight. For dots, we use it as diameter,
                        // scaled up for better visibility as discrete dots.
                        p.circle(p.mouseX, p.mouseY, currentSize * 4);
                    } else if (currentMode === 1) { // Solid mode: draw continuous lines
                        p.stroke(currentColor); // Set line color
                        p.strokeWeight(currentSize); // Set line thickness
                        p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY); // Draw line from previous to current mouse position
                        p.noFill(); // Lines generally don't have fill
                    }
                }
            };

            // --- p5.js WindowResized Function ---
            // This function is called whenever the browser window is resized.
            p.windowResized = () => {
                const parentWidth = sketchRef.current.offsetWidth;
                // Resize the canvas, capping its width at 500px to maintain the original aspect
                p.resizeCanvas(p.min(500, parentWidth), 500);
            };
        };

        // Initialize the p5.js sketch
        if (sketchRef.current) {
            // Remove any existing p5.js instance to prevent multiple sketches
            // if the component re-renders (important for React lifecycle).
            if (sketchInstance) {
                sketchInstance.remove();
            }
            // Create a new p5.js instance, passing the sketch function and the DOM element to attach to.
            const newSketchInstance = new p5(sketch, sketchRef.current);
            setSketchInstance(newSketchInstance);
        }

        // Cleanup function: This runs when the component unmounts.
        // It's crucial to remove the p5.js instance to prevent memory leaks and ensure
        // event listeners are properly detached.
        return () => {
            if (sketchInstance) {
                sketchInstance.remove();
            }
        };
    }, []); // Empty dependency array ensures this effect runs only once on mount and cleanup on unmount.

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl flex flex-col items-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                    Web Paint App
                </h1>
                <p className="text-gray-600 mb-6 text-center">
                    Draw on the canvas with your mouse! Use the following keys: <br/>
                    <span className="font-bold">R</span> - Red, <span className="font-bold">G</span> - Green, <span className="font-bold">B</span> - Blue (Change drawing color) <br/>
                    <span className="font-bold">D</span> - Dotted, <span className="font-bold">S</span> - Solid (Change drawing mode) <br/>
                    <span className="font-bold">1-5</span> - Change stroke weight/dot size <br/>
                    <span className="font-bold">C</span> - Clear canvas (white background) <br/>
                    <span className="font-bold">V</span> - Save current canvas as 'Screenshot.jpg'
                </p>
                {/* The div where the p5.js canvas will be inserted.
                    It has fixed max dimensions to mimic the original Processing sketch size,
                    while also being responsive to smaller screens. */}
                <div
                    ref={sketchRef}
                    className="w-full bg-gray-200 rounded-lg overflow-hidden border border-gray-300"
                    style={{ maxWidth: '500px', height: '500px' }}
                >
                    {/* The p5.js canvas will be injected here by the sketch. */}
                </div>
                <div className="mt-6 text-sm text-gray-500 text-center">
                    This web paint app is a translation of Evaristo Campos's Midterm Exam Question 1.
                </div>
            </div>
        </div>
    );
};

export default App; // Export the main App component for use in your React application.
