/**
 * Created by Lionel Médini on 03/05/2015.
 * Convenient module that returns the command stores indexed in the config file.
 * Historically, they used to be included in the config file, creating circular dependencies when these modules depended on the app configuration.
 */
define(['DBLPCommandStore', 'DDGoCommandStore','GoogleCommandStore', 'LocalCommandStore', 'VotingSystemCommandStore'],
    function(DBLPCommandStore, DDGoCommandStore, GoogleCommandStore, LocalCommandStore, VotingSystemCommandStore) {
        return {
            'DBLPCommandStore': DBLPCommandStore,
            'DDGoCommandStore': DDGoCommandStore,
            'GoogleCommandStore': GoogleCommandStore,
            'LocalCommandStore': LocalCommandStore,
            'VotingSystemCommandStore': VotingSystemCommandStore
        };
    }
);