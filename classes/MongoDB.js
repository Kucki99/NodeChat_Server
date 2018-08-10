var MongoClient = require('mongodb').MongoClient;

let secret = require('./secret');

MongoDB.INSTANCE = null;

MongoDB.getInstance = function () {
    if (this.INSTANCE === null) {
        this.INSTANCE = new MongoDB();
    }
    return this.INSTANCE;
};

function MongoDB() {
    this.createConnection();
}

MongoDB.prototype = {
    constructor: MongoDB,

    createConnection: function () {
        MongoClient.connect(secret.mongoUrl, function(err, db) {
            if (err) throw err;
            console.log("Database created!");
            db.close();
        }, { useNewUrlParser: true });
    }
};

module.exports = MongoDB;