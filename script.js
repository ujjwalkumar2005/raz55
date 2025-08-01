// console.log("let's write javascript")
let currentSong = new Audio();

let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');

    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes} : ${formattedSeconds}`;

}

async function getSongs(folder) {
    currFolder = folder;

    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    console.log(response);

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    //   console.log(as)
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
    
                        <img src="music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div> Taylor Swift </div>
                               
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="play2.svg" alt="playing">
                            </div>
                       
     </li> `;

    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })

    })

    return songs


}


const playMusic = (track, pause = false) => {

    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }


    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}


async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}"  class="card">
                        <div   class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="47px" height="47px"
                                viewBox="0 0 408.221 408.221">

                                <circle cx="204.11" cy="204.11" r="204.11" fill="#1fdf64" />


                                <path fill="black"
                                    d="M286.547,229.971l-126.368,72.471c-17.003,9.75-30.781,1.763-30.781-17.834V140.012
                                c0-19.602,13.777-27.575,30.781-17.827l126.368,72.466C303.551,204.403,303.551,220.217,286.547,229.971z" />
                            </svg>


                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>
 `

        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            songs = await getSongs(`songs/${item.currentTarget.dataset.folder
                }`)
           playMusic(songs[0])

        })

    })


}


async function main() {

    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    displayAlbums()




    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }

        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })


    previous.addEventListener("click", () => {

        currentSong.pause()
        console.log("previous clicked")
        console.log(currentSong)

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })

    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }

    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

        console.log(e, e.target, e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
        if(currentSong.volume > 0){
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.src.replace("mute.svg", "volume.svg")
        }

    })


    document.querySelector(".volume > img").addEventListener("click", e => {
        console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })




}

main()