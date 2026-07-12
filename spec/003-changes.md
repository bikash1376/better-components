1. i want to removing the landing page image and use this bg instaed (also remove scrolling and  zoom in=out whatever is implemented). Make sure i can change the image src anytime no height-width changes rquired : <div className="min-h-screen w-full relative bg-black">
    {/* Prismatic Aurora Burst - Multi-layered Gradient */}
    <div
      className="absolute inset-0 z-0"
      style={{
        background: `
          radial-gradient(ellipse 120% 80% at 70% 20%, rgba(255, 20, 147, 0.15), transparent 50%),
          radial-gradient(ellipse 100% 60% at 30% 10%, rgba(0, 255, 255, 0.12), transparent 60%),
          radial-gradient(ellipse 90% 70% at 50% 0%, rgba(138, 43, 226, 0.18), transparent 65%),
          radial-gradient(ellipse 110% 50% at 80% 30%, rgba(255, 215, 0, 0.08), transparent 40%),
          #000000
        `,
      }}
    />
    {/* Your Content/Components */}
  </div>

2. Add image support to the flipbook component and also mention that image width height should be same (give a size option controls to decrease increase)- so basically emoji/text and image both will be there. so there would be image prop or something i believe.

3. When someone opens animate app in small screen - dont show the editor - instead ask for desktop to open and say WIP to make this mobile friendly.

4. Add a avatar component that lets user choose avatar. Use dicebear (only if they are mit licensed or something free to use) if they allow or we can use shaders (gradient) from paper to generate determinstic avatars like dicebear or random - no seed. Do a bit of web search for this.

5. Make the animate a thumbnail image instead of the component (to avoid tour options opening up as soon as i hover in components page). use this image ref/animate-thumbnail.png , move it anywhere that fits like public folder as we are not pushing the ref folder.

6. in specific components page - Instead of the right bottom vertical bar, add the view code icon just after the npm command on top. inside that there will be github icon that links to the repo folder. we dont need icon library  - remove it. move the theme changer in sidebar. remove these from the sidebar "bettercomp

19 in the library". search icon should also be somewhere on top (think minimal design u can add urself)