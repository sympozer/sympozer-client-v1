/**
 * Created by Lionel on 29/01/2015.
 */

define(function() {
    return function (id, name, homepageUri, imageUri, mbox, accounts, organizationUris, publicationUris, roleUris) {
        this.id = id;
        this.name = name;
        this.homepage = homepageUri;
        this.depiction = imageUri;
        this.mbox = mbox;
        this.accounts = accounts;
        this.affiliations = organizationUris;
        this.made = publicationUris;
        this.hasRoles = roleUris;
        this.serialize = function () {
            var res = {
                "head": {
                    "vars": ["organizationUri", "publicationUri", "roleUri"]
                },
                "results": {
                    "bindings": []
                }
            };

            if (this.id) {
                res.head.vars.push("personUri");
                res.results.bindings.push({"personUri": {"type": "uri", "value": this.id}});
            }

            if (this.name) {
                res.head.vars.push("personName");
                res.results.bindings.push({"personName": {"type": "literal", "value": this.name}});
            }

            if (this.homepage) {
                res.head.vars.push("personHomepage");
                res.results.bindings.push({"personHomepage": {"type": "uri", "value": this.homepage}});
            }

            if (this.depiction) {
                res.head.vars.push("personImg");
                res.results.bindings.push({"personImg": {"type": "uri", "value": this.depiction}});
            }

            if (this.mbox) {
                res.head.vars.push("mbox");
                res.results.bindings.push({"mbox": {"type": "uri", "value": this.mbox}});
            }

            if (this.accounts != null && Array.isArray(this.accounts) && this.accounts.length > 0) {
                res.head.vars.push("accountUri");
                for (var i in this.accounts) {
                    res.results.bindings.push({"accountUri": {"type": "uri", "value": this.accounts[i]}});
                }
            }

            if (this.affiliations != null && Array.isArray(this.affiliations) && this.affiliations.length > 0) {
                res.head.vars.push("organizationUri");
                for (var i in this.affiliations) {
                    res.results.bindings.push({"organizationUri": {"type": "uri", "value": this.affiliations[i]}});
                }
            }

            if (this.made != null && Array.isArray(this.made) && this.made.length > 0) {
                res.head.vars.push("publicationUri");
                for (var i in this.made) {
                    res.results.bindings.push({"publicationUri": {"type": "uri", "value": this.made[i]}});
                }
            }
            return res;
        };
    };
});