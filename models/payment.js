(function() {
  module.exports = function(sequelize, DataTypes) {
    var Payment;
    Payment = sequelize.define("Payment", {
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      wallet_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isValidAddress: function(value) {
            var pattern;
            pattern = /^[1-9A-Za-z]{27,34}/;
            if (!pattern.test(value)) {
              throw new Error("Invalid address.");
            }
          }
        }
      },
      amount: {
        type: DataTypes.FLOAT.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
        validate: {
          isFloat: true,
          notNull: true,
          min: 0.00000001
        }
      },
      status: {
        type: DataTypes.ENUM,
        values: ["pending", "processed", "canceled"],
        defaultValue: "pending"
      },
      log: {
        type: DataTypes.TEXT
      },
      remote_ip: {
        type: DataTypes.STRING
      }
    }, {
      tableName: "payments",
      classMethods: {
        findById: function(id, callback) {
          return Payment.find(id).complete(callback);
        },
        findByUserAndWallet: function(userId, walletId, status, callback) {
          var query;
          query = {
            where: {
              user_id: userId,
              wallet_id: walletId,
              status: status
            }
          };
          return Payment.findAll(query).complete(callback);
        },
        findByStatus: function(status, callback) {
          var query;
          query = {
            where: {
              status: status
            },
            order: [["created_at", "ASC"]]
          };
          return Payment.findAll(query).complete(callback);
        },
        findByTransaction: function(transactionId, callback) {
          var query;
          query = {
            where: {
              transaction_id: transactionId
            }
          };
          return Payment.find(query).complete(callback);
        }
      },
      instanceMethods: {
        isProcessed: function() {
          return this.status === "processed";
        },
        isCanceled: function() {
          return this.status === "canceled";
        },
        isPending: function() {
          return this.status === "pending";
        },
        process: function(response, callback) {
          var e;
          if (callback == null) {
            callback = function() {};
          }
          this.status = "processed";
          this.transaction_id = response;
          if (!this.log) {
            this.log = "";
          }
          if (this.log.length) {
            this.log += ",";
          }
          try {
            this.log += JSON.stringify(response);
          } catch (_error) {
            e = _error;
          }
          return this.save().complete(callback);
        },
        cancel: function(reason, callback) {
          var e;
          if (callback == null) {
            callback = function() {};
          }
          this.status = "canceled";
          reason = JSON.stringify(reason);
          if (!this.log) {
            this.log = "";
          }
          if (this.log.length) {
            this.log += ",";
          }
          try {
            this.log += JSON.stringify(reason);
          } catch (_error) {
            e = _error;
          }
          return this.save().complete(function(e, p) {
            return callback(reason, p);
          });
        },
        errored: function(reason, callback) {
          var e;
          if (callback == null) {
            callback = function() {};
          }
          reason = JSON.stringify(reason);
          if (!this.log) {
            this.log = "";
          }
          if (this.log.length) {
            this.log += ",";
          }
          try {
            this.log += JSON.stringify(reason);
          } catch (_error) {
            e = _error;
          }
          return this.save().complete(function(e, p) {
            return callback(reason, p);
          });
        }
      }
    });
    return Payment;
  };

}).call(this);