/**
 * Created by Lionel on 29/01/2015.
 */

define(function() {
    return function (uri, name, homepageUri, imageUri, mbox, accounts, organizationUris, publicationUris, roleUris) {
        this.uri = uri;
        this.name = name;
        this.homepage = homepageUri;
        this.image = imageUri;
        this.mbox = mbox;
        this.accounts = accounts;
        this.organizations = organizationUris;
        this.publications = publicationUris;
        this.roles = roleUris;
        this.serialize = function () {
            var res = {
                "head": {
                    "vars": ["organizationUri", "publicationUri", "roleUri"]
                },
                "results": {
                    "bindings": []
                }
            };

            if (this.uri) {
                res.head.vars.push("personUri");
                res.results.bindings.push({"personUri": {"type": "uri", "value": this.uri}});
            }

            if (this.name) {
                res.head.vars.push("personName");
                res.results.bindings.push({"personName": {"type": "literal", "value": this.name}});
            }

            if (this.homepage) {
                res.head.vars.push("personHomepage");
                res.results.bindings.push({"personHomepage": {"type": "uri", "value": this.homepage}});
            }

            if (this.image) {
                res.head.vars.push("personImg");
                res.results.bindings.push({"personImg": {"type": "uri", "value": this.image}});
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

            if (this.organizations != null && Array.isArray(this.organizations) && this.organizations.length > 0) {
                res.head.vars.push("organizationUri");
                for (var i in this.organizations) {
                    res.results.bindings.push({"organizationUri": {"type": "uri", "value": this.organizations[i]}});
                }
            }

            if (this.publications != null && Array.isArray(this.publications) && this.publications.length > 0) {
                res.head.vars.push("publicationUri");
                for (var i in this.publications) {
                    res.results.bindings.push({"publicationUri": {"type": "uri", "value": this.publications[i]}});
                }
            }
            return res;
        };
    };
});