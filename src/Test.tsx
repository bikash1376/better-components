import React from 'react'

const Test = () => {
  return (
    <div className="min-h-screen w-full relative">
  {/* SVG Background */}
  <div 
    className="fixed inset-0 z-0 min-h-screen w-full pointer-events-none"
    style={{ width: '100vw', height: '100vh' }}
    dangerouslySetInnerHTML={{ __html: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1536 776" preserveAspectRatio="none" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;">
  <defs>
    <filter id="blur1" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="161" result="blur" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="hsl(342, 55.475705725419225%, 71.77010815724385%)" />
  <g filter="url(#blur1)">
    <circle cx="1214.2416589067234" cy="643.9895795901658" r="630.6666637193853" fill="hsl(144, 69.3954588142245%, 72.41834449255308%)" /><circle cx="1477.342859251179" cy="635.6647723011514" r="569.8415561393299" fill="hsl(196, 60.28296318909516%, 64.11271301738536%)" /><circle cx="734.8443785084864" cy="427.7855844171152" r="554.4689486022133" fill="hsl(9, 76.36769759790894%, 65.33010970105882%)" /><circle cx="521.8309848910073" cy="366.0204596876938" r="590.029871039864" fill="hsl(261, 50.582132361924664%, 74.72848296424453%)" /><circle cx="1047.075272761006" cy="553.7501258214362" r="631.1855458966503" fill="hsl(28, 57.615143466262495%, 73.33735702028008%)" /><circle cx="1022.2863007867489" cy="539.870855840605" r="538.5378512343257" fill="hsl(296, 60.54066082674779%, 78.69425312260361%)" />
  </g>
</svg>` }} 
  />
  <h1>hell yeah</h1>
  {/* Your content here */}
</div>
  )
}

export default Test
