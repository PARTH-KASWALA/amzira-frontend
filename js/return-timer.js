class ReturnTimer {
    constructor(data, callbacks) {
        this.clockOffset = Date.now() - new Date(data.server_time).getTime();
        this.deadline = new Date(data.return_deadline).getTime();
        this.onTick = callbacks.onTick;
        this.onExpire = callbacks.onExpire;
        this.timeoutId = null;
    }

    now() {
        return Date.now() - this.clockOffset;
    }

    start() {
        const tick = () => {
            const ms = Math.max(0, this.deadline - this.now());
            this.onTick(ms);

            if (ms <= 0) {
                this.timeoutId = null;
                this.onExpire();
                return;
            }

            this.timeoutId = setTimeout(tick, 1000);
        };

        tick();
    }

    stop() {
        if (!this.timeoutId) {
            return;
        }

        clearTimeout(this.timeoutId);
        this.timeoutId = null;
    }
}

window.ReturnTimer = ReturnTimer;
