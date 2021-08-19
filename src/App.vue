<template>
    <div id="app">
        <div class="player">
            <div class="cover"></div>
            <nav>
                <!-- <div class="left" style="-webkit-app-region: drag;cursor: pointer !important;"> -->
                <i @click="emitMain('show-context-menu')" class="material-icons">menu</i>
                <!-- </div> -->
                <!-- <div class="right"> -->
                <i @click="emitMain('player-files-folder')" class="material-icons search">library_music</i>
                <i @click="muteAll()" class="material-icons search">{{ muted ? 'volume_off' : 'volume_up' }}</i>
                <i @click="emitMain('close-app')" class="material-icons">close</i>
                <!-- </div> -->
            </nav>
            <div class="player-ui">
                <div class="title">
                    <h3 style="-webkit-app-region: drag;">{{ title }}</h3>
                </div>
                <div class="small hidden">
                    <i class="material-icons">replay</i>
                    <p>Adele</p>
                    <i class="material-icons">volume_up</i>
                </div>
                <div class="progress">
                    <div class="played" :style="'width:' + player_percent + '%'">
                        <div class="circle" :style="'margin-left:' + (player_percent * 4.9) + 'px'"></div>
                    </div>
                </div>
                <div class="controls">
                    <switches theme="bootstrap" type-bold="true" color="success" label="Azan" v-model="azanEnabled"></switches>
                    <i class="material-icons">play_arrow</i>
                    <switches theme="bootstrap" type-bold="true" color="info" label="Azkar" v-model="azkarEnabled"></switches>
                </div>
                <!-- <div class="controls" style="justify-content: center;padding-top: 0px;"> -->
                <!-- <i class="material-icons">skip_previous</i> -->
                <!-- <i class="material-icons">{{ playing ? 'pause_arrow' : 'play_arrow' }}</i> -->
                <!-- <i class="material-icons">play_arrow</i> -->
                <!-- <i @click="nextSound('player')" class="material-icons">skip_next</i> -->
                <!-- </div> -->
            </div>
            <!-- <div class="btn"> -->
            <!-- 		<i class="material-icons">shuffle</i> -->
            <!-- </div> -->
            <div class="music">
                <div :id="'sound' + i" v-for="(sound,i) in sounds" :key="i" class="song-1">
                    <div class="info">
                        <div class="img first"></div>
                        <div class="titles">
                            <h5>{{ baseName(sound) }}</h5>
                            <p>Quran Radio</p>
                        </div>
                    </div>
                    <div v-if="SoundIndex==i" class="state playing">
                        <i @dblclick="!isProduction() ? emitMain('show-developer-tools') : ''" class="material-icons">equalizer</i>
                    </div>
                    <div v-else class="state">
                        <i class="material-icons">play_arrow</i>
                    </div>
                </div>

            </div>
        </div>

        <p class="d-none">
            <!-- <p> -->
            <audio-player :html5="true" id="player" ref="player" :sources="items"></audio-player>
            <audio-player :html5="true" id="secondary" ref="secondary" :sources="['./mp3/1.mp3']"></audio-player>
            <audio-player :html5="true" id="player2" ref="player2" :sources="['./mp3/azan/'+player2_items+'.mp3']"></audio-player>

            <audio controls id="bayanyan" src="mp3/zikr/bayanyan.mp3"></audio>
            <audio controls id="ewaran" src="mp3/zikr/ewaran.mp3"></audio>
        </p>
    </div>
</template>

<script>
import AudioPlayer from './Components/audio-player.vue'
// import prayer_times from './prayer_times.js';
import moment from 'moment'
import Switches from 'vue-switches';
import { ipcRenderer } from 'electron'
const fs = require('fs');


export default {
    name: 'App',
    data() {
        return {
            azkarEnabled: true,
            azanEnabled: true,

            items: ['./mp3/bsmila.mp3',],

            muted: false,

            player2: false,
            playing: false,
            title: 'Quran Radio',
            player_percent: 100,
            SoundIndex: 0,

            sounds: [],

            player2_items: '0-Bayany',

            mp3Path: '',

        }
    },
    components: {
        AudioPlayer,
        Switches
    },
    methods: {
        nextSound(payload) {
            if (payload == 'player' && !this.player2) {
                this.$refs.secondary.play()
                setTimeout(() => {
                    this.SoundIndex = this.sounds.findIndex(x => x == this.items[0]);
                    ++this.SoundIndex
                    if (this.SoundIndex == this.sounds.length) {
                        this.SoundIndex = 0
                    }
                    this.items = [this.sounds[this.SoundIndex]]

                    this.title = this.baseName(this.items[0])

                    setTimeout(() => {
                        this.$scrollTo('#sound' + this.SoundIndex)
                        this.$refs.player.play()
                    }, 0);
                }, 5500);
            }

        },

        // importAll(r) {
        //     r.keys().forEach(name => {

        //         // './mp3/player/w01.mp3',
        //         let fileName = name.substr(2, name.length);
        //         this.sounds.push('./mp3/player/' + fileName)

        //     });
        //     console.log(this.sounds);
        // },

        muteAll() {
            this.muted = !this.muted

            let bayanyan_selector = document.querySelector("#bayanyan")
            let ewaran_selector = document.querySelector("#ewaran")

            bayanyan_selector.muted = !bayanyan_selector.muted
            ewaran_selector.muted = !ewaran_selector.muted

            this.$refs.player.toggleMute()
            this.$refs.secondary.toggleMute()
            this.$refs.player2.toggleMute()
        },


        emitMain(name) {
            ipcRenderer.send(name)
        },

        contextMenu() {
            addEventListener('contextmenu', (e) => {
                e.preventDefault()
                this.emitMain('show-context-menu')
            })

            ipcRenderer.on('context-menu-command', (e, command) => {
                switch (command) {
                    case 'refresh':
                        window.location.reload()
                        break;

                    case 'mute':
                        this.muteAll()
                        break;

                    default:
                        break;
                }
            })
        },

        isProduction() {
            return !process.execPath.match(/dist[\\/]electron/i)
        }
    },

    mounted() {
        window.moment = moment


        this.contextMenu()

        let playerPath = `${process.cwd()}/public/mp3/player/`

        if (this.isProduction()) {
            playerPath = `${process.cwd()}/resources/app/mp3/player/`
        } else {
            this.muteAll()
        }

        // prayerTimes
        let prayerTimes = {}
        fs.readFile(playerPath + '../../PrayerTimes.txt', 'utf8', function (err, data) {
            data.toString().replace(/\r\n/g, '\n').split('\n').forEach(day => {
                let date = day.split(',')[0]
                if (date != 'Date') {
                    prayerTimes[date] = day.split(',').slice(1).join('|')
                }
            });
        });

        let azkarTimes = {}
        fs.readFile(playerPath + '../../AzkarTimes.txt', 'utf8', function (err, data) {
            data.toString().replace(/\r\n/g, '\n').split('\n').forEach(day => {
                let d = day.split('=')
                if (d[0].toLowerCase() == 'bayanyan')
                    azkarTimes.bayanyan = d[1].trim()

                if (d[0].toLowerCase() == 'ewaran')
                    azkarTimes.ewaran = d[1].trim()
            });
        });

        // this.importAll(require.context('../public/mp3/player/', true, /\.mp3$/));
        fs.readdir(playerPath, (err, files) => {
            files.forEach(file => {
                if (file.split('.').pop() == 'mp3')
                    this.sounds.push('./mp3/player/' + file)
            });
        });

        this.$root.$on('NextSound', payload => this.nextSound(payload))

        this.$root.$on('ProgressChanging', p => this.player_percent = p)
        this.$root.$on('Playing', p3 => this.playing = p3)


        setTimeout(() => {
            this.$refs.player.play()
        }, 0);


        setInterval(() => {
            // Azan
            const today = new Date();
            // const today_prayers = prayer_times[today.getMonth() + 1][today.getDate()]
            let now = moment(new Date())
            const today_prayers = prayerTimes[now.format("MM-DD")]
            // const fullTime = this.formatTime().hour + ':' + this.formatTime().minute
            const fullTime = now.format("hh:mm")

            let types = {
                0: 'Bayani',
                1: 'Cheshtangaw',
                2: 'Niwaro',
                3: 'Asr',
                4: 'Maghrib',
                5: 'Isha',
            };

            let mp3_types = {
                0: '0-Bayany',
                1: '0-Bayany',
                2: '2-Niwaro',
                3: '3-Asr',
                4: '4-Ewara',
                5: '5-Esha',
            };

            let today_prayers_arr = today_prayers.split('|')


            let today_prayers_index = today_prayers_arr.findIndex(x => x == fullTime)

            if (today_prayers_arr.includes(fullTime) && !this.player2 && today_prayers_index != 1 && this.azanEnabled) {
                this.player2 = true
                this.$refs.player.stop()
                this.$refs.secondary.stop()
                this.$refs.player2.stop()

                this.player2_items = mp3_types[today_prayers_index]
                console.log(this.player2_items);

                setTimeout(() => {
                    this.$refs.player2.play()
                }, 200);


                setTimeout(() => {

                    console.log('Azan')
                    console.log(types[today_prayers_index])
                    console.log(today_prayers_arr[today_prayers_index])

                    setTimeout(() => {
                        this.player2 = false
                        this.$refs.player2.stop()
                        this.nextSound('player')
                    }, this.$refs.player2.duration * 1000);
                    console.log(this.$refs.player2.duration * 1000);
                }, 300);

            }


            // Azkar
            // Bayanyan
            // let bayanyan_time = moment(moment(new Date()).format("YYYY-MM-DD") + " " + today_prayers_arr[1]).add(1, 'hours').format("h:mm");
            // let ewaran_time = moment(moment(new Date()).format("YYYY-MM-DD") + " " + today_prayers_arr[4]).subtract(1, 'hours').format("h:mm");

            let bayanyan_selector = document.querySelector("#bayanyan")
            let ewaran_selector = document.querySelector("#ewaran")

            if ((azkarTimes.bayanyan == fullTime || azkarTimes.ewaran == fullTime) && !this.player2 && this.azkarEnabled) {

                this.$refs.player2.stop()
                this.$refs.secondary.stop()
                this.$refs.player.stop()


                this.player2 = true
                if (azkarTimes.bayanyan == fullTime) {
                    bayanyan_selector.pause()
                    bayanyan_selector.currentTime = 0;
                    bayanyan_selector.play()

                    setTimeout(() => {
                        this.player2 = false
                        bayanyan_selector.pause()
                        bayanyan_selector.currentTime = 0;
                        ewaran_selector.pause()
                        ewaran_selector.currentTime = 0;

                    }, bayanyan_selector.duration * 1000);
                }

                if (azkarTimes.ewaran == fullTime) {
                    ewaran_selector.pause()
                    ewaran_selector.currentTime = 0;
                    ewaran_selector.play()

                    setTimeout(() => {
                        this.player2 = false
                        bayanyan_selector.pause()
                        bayanyan_selector.currentTime = 0;
                        ewaran_selector.pause()
                        ewaran_selector.currentTime = 0;

                    }, ewaran_selector.duration * 1000);
                }

            }

        }, 900);

    },
}
</script>

<style>
@font-face {
    font-family: "Material Icons";
    font-style: normal;
    font-weight: 400;
    src: url("../public/assets/fonts/Material Icons.woff2") format("woff2");
}

.material-icons {
    font-family: "Material Icons";
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
}

html {
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
}

html,
body {
    margin: 0;
    height: 100%;
    align-items: center;
    color: #333;
    font-family: tahoma;
    font-size: 1em;
    -webkit-font-smoothing: antialiased;
    line-height: 1em;
}

.d-none {
    display: none;
}

.hidden {
    visibility: hidden;
}

body {
    background: #e9e9e9;
    display: flex;
    justify-content: center;
}

* {
    box-sizing: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

i {
    cursor: pointer;
}

.player {
    overflow: hidden;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.6);
    position: relative;
    width: 320px;
    /* height: 510px; */
    height: 750px;
    background-size: contain;
    background-repeat: no-repeat;
}
.player .cover {
    position: absolute;
    z-index: 1;
    width: 320px;
    height: 250px;
    background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)),
        url("../public/assets/quran.jpg") center bottom;
    background-size: cover;
}
.player nav {
    color: #ffffff;
    margin-top: 5px;
    position: relative;
    z-index: 3;
    min-height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px 15px;
}
.player nav .left {
    display: flex;
}
.player nav .left i {
    cursor: pointer;
    color: white;
}
.player nav .left h6 {
    margin: 0;
    padding-left: 20px;
    color: white;
    font-size: 18px;
    line-height: 1.38;
}
.player nav .right {
    display: flex;
}
.player nav .right i {
    cursor: pointer;
    color: white;
}
.player nav .right .search {
    padding-right: 10px;
}
.player .player-ui {
    position: relative;
    z-index: 3;
    padding-top: 16px;
}
.player .player-ui .title {
    display: flex;
    justify-content: center;
}
.player .player-ui .title h3 {
    margin: 0;
    color: white;
    font-size: 20px;
    font-weight: 100;
}
.player .player-ui .small {
    padding: 15px 35px 0px 35px;
    display: flex;
    justify-content: space-between;
}
.player .player-ui .small p,
.player .player-ui .small i {
    margin: 0;
    color: white;
    font-size: 14px;
}
.player .player-ui .small p {
    color: #ddd;
}
.player .player-ui .small i {
    font-size: 16px;
}
.player .player-ui .progress {
    position: relative;
    height: 2px;
    margin: 30px 20px 0px 20px;
    background: rgba(255, 255, 255, 0.3);
}
.player .player-ui .progress .played {
    width: 20%;
    height: 2px;
    position: absolute;
    background: #f44336;
}
.player .player-ui .progress .played .circle {
    width: 10px;
    height: 10px;
    background: #f44336;
    border-radius: 50%;
    margin-left: 52px;
    margin-top: -4px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.7);
}
.player .player-ui .controls {
    display: flex;
    justify-content: space-between;
    padding: 25px 50px 0px 50px;
}
.player .player-ui .controls i {
    color: white;
    font-size: 32px;
}
.player .btn {
    margin-left: auto;
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 4;
    margin-top: 20px;
    width: 40px;
    height: 0;
    border-radius: 50%;
}
.player .btn i {
    font-size: 28px;
    color: white;
}
.player .music {
    padding: 10px 20px 0px 20px;
    background: #1a1b1e;
    margin-top: 23px;
    /* margin-top: -26px; */
}
.player .music .song-1,
.player .music .song-2,
.player .music .song-3,
.player .music .song-4 {
    height: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
.player .music .song-1 .info,
.player .music .song-2 .info,
.player .music .song-3 .info,
.player .music .song-4 .info {
    display: flex;
    align-items: center;
}
.player .music .song-1 .info .img,
.player .music .song-2 .info .img,
.player .music .song-3 .info .img,
.player .music .song-4 .info .img {
    width: 60px;
    height: 60px;
    background: red;
    margin-right: 10px;
}
.player .music .song-1 .info .img.first,
.player .music .song-2 .info .img.first,
.player .music .song-3 .info .img.first,
.player .music .song-4 .info .img.first {
    background: url("../public/assets/quran.jpg") center center;
    background-size: cover;
}

.player .music .song-1 .info .titles h5,
.player .music .song-1 .info .titles p,
.player .music .song-2 .info .titles h5,
.player .music .song-2 .info .titles p,
.player .music .song-3 .info .titles h5,
.player .music .song-3 .info .titles p,
.player .music .song-4 .info .titles h5,
.player .music .song-4 .info .titles p {
    margin: 0;
    color: white;
}
.player .music .song-1 .info .titles h5,
.player .music .song-2 .info .titles h5,
.player .music .song-3 .info .titles h5,
.player .music .song-4 .info .titles h5 {
    font-size: 17px;
    font-weight: 400;
    margin-bottom: 7px;
}
.player .music .song-1 .info .titles p,
.player .music .song-2 .info .titles p,
.player .music .song-3 .info .titles p,
.player .music .song-4 .info .titles p {
    font-size: 13px;
    color: #929292;
}
.player .music .song-1 .state.playing i,
.player .music .song-2 .state.playing i,
.player .music .song-3 .state.playing i,
.player .music .song-4 .state.playing i {
    color: #f44336;
}
.player .music .song-1 .state i,
.player .music .song-2 .state i,
.player .music .song-3 .state i,
.player .music .song-4 .state i {
    color: #ddd;
}

.player {
    /* min-width: 25% !important; */
    width: 533px !important;
}

.player .cover,
#app {
    min-width: 100% !important;
    display: flex;
    justify-content: center;
}

.player .music {
    display: block !important;
    overflow-y: scroll !important;
    height: 503px !important;
    /* height: 267px !important; */
}

.vue-switcher--bold .vue-switcher__label span {
    color: #fff !important;
    font-size: 20px !important;
    padding-bottom: 14px !important;
}

::-webkit-scrollbar {
    background-color: #fff;
    width: 10px;
}

/* background of the scrollbar except button or resizer */
::-webkit-scrollbar-track {
    background-color: #fff;
}
::-webkit-scrollbar-track:hover {
    background-color: #f4f4f4;
}

/* scrollbar itself */
::-webkit-scrollbar-thumb {
    background-color: #babac0;
}
::-webkit-scrollbar-thumb:hover {
    background-color: #a0a0a5;
}

/* set button(top and bottom of the scrollbar) */
::-webkit-scrollbar-button {
    display: none;
}
</style>