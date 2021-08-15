<script>
import VueHowler from 'vue-howler'

export default {
    mixins: [VueHowler],
    props: ['id'],


    watch: {
        progress() {
            if (typeof this.progress !== "undefined") {
                if (this.progress === 0) {
                    this.$root.$emit('NextSound', this.id)
                }

                if (this.id == 'player') {
                    this.$root.$emit('ProgressChanging', this.progress * 100)
                    this.$root.$emit('Playing', this.playing)
                }
                // console.log(this.progress);
            }
        }
    },
}
</script>

<template>
    <div>
        <span>Total duration: {{ duration }} seconds</span>
        <!-- <span>Progress: {{ (progress * 100) }}%</span> -->
        <button @click="togglePlayback">{{ playing ? 'Pause' : 'Play' }}</button>
        <!-- <button @click="stop">Stop</button> -->
    </div>
</template>