<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>neoUNIVERSE | neoSHADE Official Portal</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=VT323&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      background: #0a0a0a;
      color: #00ffea;
      font-family: 'Orbitron', sans-serif;
      overflow-x: hidden;
    }

    .banner {
      width: 100%;
      height: 420px;
      background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('https://neo-shade.com/wp-content/uploads/2026/06/universe-banner.jpg');
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border-bottom: 4px solid #ff00ff;
      box-shadow: 0 0 60px #ff00ff;
      animation: glitch-banner 4s infinite alternate;
    }

    @keyframes glitch-banner {
      0% { background-position: center; }
      50% { background-position: center 2px; }
      100% { background-position: center -2px; }
    }

    .neon-text {
      font-size: 4.5rem;
      font-weight: 900;
      text-transform: uppercase;
      text-shadow: 
        0 0 10px #00ffea,
        0 0 20px #00ffea,
        0 0 40px #ff00ff,
        0 0 80px #ff00ff;
      animation: neon-flicker 1.5s infinite alternate;
      letter-spacing: 8px;
    }

    @keyframes neon-flicker {
      0% { opacity: 0.9; }
      100% { opacity: 1; text-shadow: 0 0 20px #00ffea, 0 0 40px #ff00ff; }
    }

    .container {
      max-width: 1100px;
      margin: 40px auto;
      padding: 0 20px;
    }

    h1, h2 { color: #ff00ff; text-shadow: 0 0 15px #ff00ff; }
    .section { margin: 60px 0; }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
    }

    .card {
      background: rgba(20, 20, 40, 0.8);
      border: 2px solid #00ffea;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 0 25px rgba(0, 255, 234, 0.3);
      transition: all 0.4s;
    }

    .card:hover {
      transform: translateY(-10px) scale(1.03);
      box-shadow: 0 0 40px rgba(255, 0, 255, 0.6);
      border-color: #ff00ff;
    }

    footer {
      text-align: center;
      padding: 40px;
      background: #000;
      border-top: 3px solid #ff00ff;
      margin-top: 80px;
    }

    .glitch {
      animation: glitch 2s infinite;
    }
  </style>
</head>
<body>

  <!-- BANNER -->
  <div class="banner">
    <div class="neon-text glitch">neoUNIVERSE</div>
  </div>

  <div class="container">
    <h1 style="text-align:center; font-size:3rem;">Music · Video · Lore from the neon dark</h1>
    <p style="text-align:center; font-size:1.4rem; max-width:800px; margin:30px auto;">
      The official immersive cyberpunk portal for <strong>neoSHADE (NeoShade-AI)</strong>.
    </p>

    <div class="section">
      <h2>Enter the neon dark.</h2>
      <p>
        neoUNIVERSE is the central living hub for neoSHADE’s entire audiovisual universe. 
        A surreal cyberpunk experience where cinematic IMAX-scale soundscapes, visionary videos, 
        deep emotional lore, and digital releases converge into one immersive world.
      </p>
    </div>

    <div class="section">
      <h2>Core Features</h2>
      <div class="features">
        <div class="card">
          <h3>neoPLAYER</h3>
          <p>Unified immersive player — YouTube priority, full albums, future direct MP3s.</p>
        </div>
        <div class="card">
          <h3>Releases</h3>
          <p>Official albums & singles pulled from YouTube Artist Releases.</p>
        </div>
        <div class="card">
          <h3>neoVIBES Discovery</h3>
          <p>Smart search by genre, mood, or emotion — instant curated playlists.</p>
        </div>
        <div class="card">
          <h3>Music Store</h3>
          <p>Direct $0.50 digital MP3 downloads via PayPal.</p>
        </div>
        <div class="card">
          <h3>Merch Store</h3>
          <p>Connected to official Printify store for physical products.</p>
        </div>
        <div class="card">
          <h3>Lore Hub</h3>
          <p>Deep storytelling, emotional arcs, and neoSHADE mythology.</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>The Vision</h2>
      <p>
        Built as more than a music player — neoUNIVERSE is a living creative universe. 
        From neoJAZZ to neoCLUB, neoHEALING to neoREBELLION, it connects fans directly 
        to the full emotional and sonic world of neoSHADE.
      </p>
    </div>

    <div style="text-align:center; margin:50px 0;">
      <a href="https://neo-shade.com" style="color:#00ffea; font-size:1.3rem; text-decoration:none; border:2px solid #ff00ff; padding:15px 40px; border-radius:50px; display:inline-block;">
        ← Return to neo-shade.com
      </a>
    </div>
  </div>

  <footer>
    <p>&copy; 2026 neoSHADE (NeoShade-AI) • All transmissions forged in the neon dark.</p>
    <p>Built with passion • Powered by cyberpunk soul</p>
  </footer>

</body>
</html>
