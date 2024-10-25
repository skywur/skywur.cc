// load anim
window.addEventListener('load', function() {
    // scroll to top
    window.scrollTo(0, 0);
    const wrapper = document.getElementById("wrapper");
    wrapper.style.opacity = "0";
    wrapper.addEventListener('transitionend', () => wrapper.remove());

    
    // Add mousemove event to projects
    try {
        document.getElementById("projects").onmousemove = e => {
            for(const card of document.getElementsByClassName("project")) {
                const rect = card.getBoundingClientRect(),
                x = e.clientX - rect.left,
                y = e.clientY - rect.top;

            
                card.style.setProperty("--mouse-x", `${x}px`);
                card.style.setProperty("--mouse-y", `${y}px`);
            };
          };
    } catch (error) {
        console.error('projects element does not exist');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const lastfmUsername = 'skywurowo';
    const lastfmApiKey = 'c163515529978da722daa7fb4094121e'; // dont mess with my lastfm <3
    fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastfmUsername}&api_key=${lastfmApiKey}&format=json&limit=1`)
        .then(response => response.json())
        .then(data => {
            const track = data.recenttracks.track[0];
        
            if (track) {
                const artist = track.artist['#text'];
                const title = track.name;
                const url = track.url;
                const image = track.image[3]['#text'];
                console.log(`now listening to ${title} by ${artist}`);
            
                // Create the Spotify activity embed
                const embed = `
                <div class="nowPlayingBox">
                        <div class="playingContent">
                                <div id="trackArtwork"><a href="${url}"><img src="${image}"></a></div>
                                <div class="trackInfo">
                                        <p id="trackName"><a href="${url}">${title}</a></p>
                                        <div id="artist"><a href="${url}">${artist}</a></div>
                                        <a href="${url}"><img class="spotifyLogo" src="spotify.png"></a>
                                </div>
                        </div>
                </div>
                `;
            
                document.getElementById('nowPlayingContainer').innerHTML = embed;
                document.querySelector('.nowPlayingBox').style.backgroundImage = `url('${image}')`;
            }
        })
        .catch(error => console.error('Error fetching data:', error));
    
        // Scroll progress bar
    
    window.addEventListener("scroll", function () {
        const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const progressBar = document.getElementById("scroll-progress");
        const progress = (scrolled / scrollableHeight) * 100;
        progressBar.style.width = progress + "%";
    });
});

try {
    document.getElementById("age").innerText = new Date().getFullYear() - 2005;
} catch (error) {
    console.error('age element does not exist');
}

