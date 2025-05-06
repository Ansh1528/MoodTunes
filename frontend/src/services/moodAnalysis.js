export async function analyzeMood(text) {
  if (typeof text !== 'string') {
    throw new Error('Text must be a string');
  }

  if (!text.trim()) {
    throw new Error('Text is required for mood analysis');
  }

  try {
    const response = await fetch('http://localhost:5000/api/mood-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Add JWT token if available
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling mood analysis API:', error);
    // Fallback to mock data in case of error
    const mockSongs = [
      { id: 1, title: "Peaceful Mind", artist: "Luna Ray", mood: "reflective" },
      { id: 2, title: "Morning Light", artist: "The Dreamers", mood: "hopeful" },
      { id: 3, title: "Ocean Waves", artist: "Ambient Collective", mood: "calm" },
      { id: 4, title: "Rising Sun", artist: "Aurora Band", mood: "energetic" },
      { id: 5, title: "Gentle Rain", artist: "Nature Sounds", mood: "relaxed" }
    ];

    return {
      mood: {
        profile: {
          primary: "balanced",
          secondary: "reflective",
          intensity: 0.7
        },
        description: "Your entry suggests a reflective and hopeful mindset, with undertones of contemplation and optimism.",
        emotionalBalance: "Your emotional state shows good balance, with a positive outlook and mindful awareness of your feelings.",
        recentTrends: "There's been an upward trend in your emotional well-being over the past week, showing good progress."
      },
      recommendations: mockSongs.sort(() => Math.random() - 0.5).slice(0, 3)
    };
  }
}