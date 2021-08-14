export default {
    methods: {
        formatTime(d = new Date()) {
            // let hour = this.checkDigit(hour);
            let hour = d.getHours() == 0 ? 12 : d.getHours() > 12 ? d.getHours() - 12 : d.getHours();
            let minute = this.checkDigit(d.getMinutes());
            let second = this.checkDigit(d.getSeconds());
            return {
                hour: hour,
                minute: minute,
                second: second
            }

        },

        checkDigit(t) {
            return (t < 10) ? `0${t}` : t;
        },

        baseName(str) {
            var base = new String(str).substring(str.lastIndexOf('/') + 1);
            if (base.lastIndexOf(".") != -1)
                base = base.substring(0, base.lastIndexOf("."));
            return base;
        }

    },
}