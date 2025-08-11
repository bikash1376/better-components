<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>Full Page Random Blurred Blobs</title>
    <style>
        html,
        body {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            background: #111;
            overflow: hidden;
        }

        svg {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            display: block;
        }

        button {
            position: fixed;
            top: 20px;
            left: 20px;
            padding: 10px 20px;
            background: white;
            border: none;
            cursor: pointer;
            font-size: 16px;
            z-index: 10;
        }
    </style>
</head>

<body>

    <button id="regen">Regenerate</button>

    <svg id="visual" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="blur1" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="161" result="blur" />
            </filter>
        </defs>
        <rect id="bg"></rect>
        <g id="blobs" filter="url(#blur1)"></g>
    </svg>


    

<div style="width: 432px; height: 288px;" class="css-4r6d9s">
    <div style="background:#FFF;background-image:url(/bg-grid.svg);background-size:1rem;background-repeat:repeat"
        class="css-1d5xppm">
        <div class="css-1e6ma0l"><svg id="visual" viewBox="0 0 900 600" width="900" height="600">
                <defs>
                    <filter id="blur1" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
                        <feGaussianBlur stdDeviation="161" result="effect1_foregroundBlur"></feGaussianBlur>
                    </filter>
                </defs>
                <rect width="900" height="600" fill="#6600FF"></rect>
                <g filter="url(#blur1)">
                    <circle cx="661" cy="70" fill="#00CC99" r="357"></circle>
                    <circle cx="888" cy="70" fill="#6600FF" r="357"></circle>
                    <circle cx="260" cy="95" fill="#00CC99" r="357"></circle>
                    <circle cx="591" cy="292" fill="#00CC99" r="357"></circle>
                    <circle cx="26" cy="214" fill="#6600FF" r="357"></circle>
                    <circle cx="812" cy="440" fill="#00CC99" r="357"></circle>
                </g>
            </svg></div>
    </div>
    <div class="css-1kwxjrf">
        <div class="css-17ut3w1"><button style="transform: none;"><svg viewBox="0 0 32 32" stroke-linecap="round"
                    stroke-linejoin="round" stroke-width="0.125em" animate="[object Object]" class="css-1d7lmhk"
                    style="transform: rotate(720deg) translateZ(0px);">
                    <path fill="currentcolor" fill-rule="nonzero" stroke="none" stroke-width="1"
                        d="M7.38 5.555l15.592-1.367A3.419 3.419 0 0126.673 7.3L28.05 23.06a3.422 3.422 0 01-3.106 3.71L9.352 28.137a3.419 3.419 0 01-3.702-3.113L4.275 9.265a3.422 3.422 0 013.106-3.71zm.2 2.274a1.14 1.14 0 00-1.036 1.237l1.375 15.759a1.14 1.14 0 001.234 1.038l15.591-1.368a1.14 1.14 0 001.036-1.236l-1.376-15.76a1.14 1.14 0 00-1.234-1.037L7.58 7.829zm3.254 5.39a1.69 1.69 0 01-1.825-1.545 1.692 1.692 0 011.53-1.84 1.69 1.69 0 011.825 1.546 1.692 1.692 0 01-1.53 1.839zm10.065-.883a1.69 1.69 0 01-1.826-1.545 1.692 1.692 0 011.53-1.84 1.69 1.69 0 011.825 1.546 1.692 1.692 0 01-1.53 1.84zM11.72 23.373a1.69 1.69 0 01-1.825-1.545 1.692 1.692 0 011.53-1.84 1.69 1.69 0 011.825 1.545 1.692 1.692 0 01-1.53 1.84zm10.065-.883a1.69 1.69 0 01-1.825-1.545 1.692 1.692 0 011.53-1.84 1.69 1.69 0 011.825 1.546 1.692 1.692 0 01-1.53 1.84zm-5.476-4.635a1.69 1.69 0 01-1.825-1.546 1.692 1.692 0 011.53-1.839 1.69 1.69 0 011.825 1.545 1.692 1.692 0 01-1.53 1.84zM29.183 6.823l-.015.002A.915.915 0 0128.167 6c-.265-2.544-2.523-4.39-5.045-4.121h-.007a.916.916 0 01-1.002-.824.922.922 0 01.808-1.018h.002l.007-.001a6.387 6.387 0 014.718 1.408 6.498 6.498 0 012.347 4.363.922.922 0 01-.812 1.016zM8.547 32h-.008a6.395 6.395 0 01-4.578-1.818 6.51 6.51 0 01-1.96-4.553.92.92 0 01.895-.942h.016c.503-.008.917.4.926.91.044 2.559 2.134 4.595 4.67 4.55h.006a.918.918 0 01.927.91.92.92 0 01-.894.943z">
                    </path>
                </svg></button></div>
    </div>
</div>
    <script>
        function randomPastel() {
            const hue = Math.floor(Math.random() * 360);
            return `hsl(${hue}, 70%, 60%)`;
        }

        function regenBlobs() {
            const svg = document.getElementById("visual");
            const blobGroup = document.getElementById("blobs");
            const bg = document.getElementById("bg");

            const width = window.innerWidth;
            const height = window.innerHeight;

            svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
            bg.setAttribute("width", width);
            bg.setAttribute("height", height);
            bg.setAttribute("fill", randomPastel());

            blobGroup.innerHTML = "";

            for (let i = 0; i < 6; i++) {
                const cx = Math.random() * width;
                const cy = Math.random() * height;
                const r = Math.max(width, height) / 3 + Math.random() * 150;
                const color = randomPastel();

                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", cx);
                circle.setAttribute("cy", cy);
                circle.setAttribute("r", r);
                circle.setAttribute("fill", color);

                blobGroup.appendChild(circle);
            }
        }

        document.getElementById("regen").addEventListener("click", regenBlobs);
        window.addEventListener("resize", regenBlobs);

        regenBlobs(); // initial draw
    </script>

</body>

</html>
