// underscore loaded

Scoreboard = function() {
    _(this).bindAll('update', 'executeAnimation', 'finishAnimation');
    var x = arguments;
    this.setVars.apply(this, x);
    this.update();
    this.ws = new WebSocket("wss://scorelive.herokuapp.com/websocket", ["protocolOne", "protocolTwo"]);
    this.ws.onmessage = function(reply) {
        var data    = JSON.parse(reply.data);

        if (data.reset) {
            this.setVars.apply(this, x);
            this.update();
            return;
        }

        var home    = data.home || this.homePoints;
        var visitor = data.visitor || this.visitorPoints;
        this.updatePoints(parseInt(home), parseInt(visitor));
    }.bind(this);
};

Scoreboard.prototype = {
    duration: 1000,

    setVars: function( home, visitors, template) {
        this.home          = home;
        this.visitors      = visitors;
        this.template      = _(template.innerHTML).template();
        this.homePoints    = 0;
        this.visitorPoints = 0;
    },

    updatePoints: function(home, visitors) {
        this.homePoints    += home;
        this.visitorPoints += visitors;
        this.update();
    },

    update: function() {
        this.toggleDirection('up', 'down');

        this.setupAnimation();
        _(this.executeAnimation).delay(20);
        _(this.finishAnimation).delay(this.duration * 0.9);

    },

    toggleDirection: function(add, remove) {
        this.home.classList.add(add);
        this.home.classList.remove(remove);
        this.visitors.classList.add(add);
        this.visitors.classList.remove(remove);
    },

    setupAnimation: function() {
        var currentHome    = this.homePoints - 1;
        var currentVisitor = this.visitorPoints - 1;

        this.home.innerHTML = this.template({
            current:  (currentHome > 0) ? currentHome : 0,
            next: this.homePoints,
        });
        this.home.classList.remove('changed');
        this.visitors.innerHTML = this.template({
            current:  (currentVisitor > 0) ? currentVisitor : 0,
            next: this.visitorPoints
        });
        this.visitors.classList.remove('changed');
    },

    executeAnimation: function() {
        this.home.classList.add('changing');
        this.visitors.classList.add('changing');
    },

    finishAnimation: function() {
        this.home.classList.add('changed');
        this.home.classList.remove('changing');
        this.visitors.classList.add('changed');
        this.visitors.classList.remove('changing');
    }
};

new Scoreboard(
    document.querySelector('.home'),
    document.querySelector('.visitors'),
    document.querySelector('#count-template')
);
