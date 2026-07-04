# Changes/Updates in Animate

1. Remove the Docs button from Animate (apps)
2. When someone clicks on Back button, show a modal that this is not saved you'll lose your progress - leave or not.
3. When pencil is selected - it should be black or white depending upon theme.
4. Remove the shortcuts from settings (in Animate).
5. When a shape is added and the size is increased decreased - make sure if shift is pressed then the ratio of the shape must not change (just like any other software)
6. When 13th frame is added decrease the frame width to 60% or 50 of what it is right now. (frames in the timeline or the preview/thumbnail)
7. If there are multiple tracks with shapes in two tracks and i select a shape (lets say shape1) from track 1 and do bring to front or send to back on shape2, none of them works atp.
8. After 60fps add custom and Let user choose custom fps - it should open a modal and give option to enter frame start (for e.g. 23) to frame end (57) will have fps 37, and frame 38 to frame 70 will have fps 12. like this user can choose different fps for differnt segments/frames - dont let user overlap (e.g 23rd frame included in both first custom (1-23) and seconnd (23-57))
9. Give a option just on the left ofplay button to toggle loop (playing infinetly on/off).
10. Use shadcn sliders, dropdown, checkbox, modal etc. (no need to change buttons for now).
11. Use driverjs or something similar to give a walkthrough of what all are there and what thing does what. After the tour is over highlight (breathe effect) the +Add button. Use shadcn components and not theirs if possible - Prev Next Skip Tour.
12. When pencil is selected - Have a pencil icon instead of mouse import { GiPencil } from "react-icons/gi";

<GiPencil /> so gives a feel user is drawing