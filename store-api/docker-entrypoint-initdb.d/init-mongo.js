/**
 * cheeky workaround because to access ffsstore database from MONGO_URI,
 * database must be created. to create a database; insert document, adding
 * database user also works
 */

db.createUser({
    user:"ffs",
    pwd:"ffsadmin",
    roles: [
        {
            role:"readWrite",
            db:"ffsstore"
        }
    ]
});