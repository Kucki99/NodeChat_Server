let mysql = require('mysql');

Database.INSTANCE = null;
Database.INFO = {
    host: "",
    user: "",
    password: "",
    database: ""
};

Database.getInstance = function () {
    if (this.INSTANCE === null) {
        this.INSTANCE = new Database();
    }
    return this.INSTANCE;
};

function Database() {
    this.createConnection();
}

Database.prototype = {
    constructor: Database,

    createConnection: function (options) {
        this.mySQLConnection = mysql.createConnection(options || Database.INFO);
    },

};

module.exports = Database;