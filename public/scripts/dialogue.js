import {
 random
} from "/public/scripts/lib.js";

const _dialogues = {
 defaultOptions: []
};

// AVATAR: rep = reputation, con = confidence  CHARACTER: rel = relationship, agr = agreeableness

class Option {
    constructor(content, con = 0, rep = 0, rel = 0, dest, action, disable) {
        this.content = content;
        this.dest = dest;
        this.con = con;
        this.rep = rep;
        this.rel = rel;
        this.action = action;
        this.enabled = !disable;
    }

    getContent(prevOption) {
        if (this.content instanceof Function) {
            return this.content(prevOption);
        }

        return this.content;
    }

    getDestination(prevOption) {
        if (this.dest instanceof Function) {
            return this.dest(prevOption);
        }

        return this.dest;
    }
}

class OptionModule {
    constructor(options = []) {
        this.options = _dialogues.defaultOptions.concat(options);
        _dialogues[String(Object.keys(_dialogues).length-1)] = this;
    }

    addOption(option) {
        this.options.push(option);
    }

    selectOption(index) {
        return this.options[index];
    }
}

class ResponseModule {
    constructor(responses) {
        this.responses = responses || [];
        _dialogues[String(Object.keys(_dialogues).length-1)] = this;
    }

    addResponse(response) {
        this.responses.push(response);
    }
}

_dialogues.defaultOptions.push(new Option("[exit]",0,0,0,false,function() {
 endDialogue();
}));

let entry = new OptionModule();

entry.addOption(new Option(function(){return `Hi, I'm ${$AVATAR?.character}.`},0,0,0,[1,0]));
entry.addOption(new Option("Do you think you could spare some change? I need to eat today",0,0,0,false,false,true));
entry.addOption(new Option("You have a shirt soi could get a job?"));
entry.addOption(new Option("Max should see me make a move on you!"));
entry.addOption(new Option("Whatever cracker.."));
entry.addOption(new Option("I think i just pee'd myself. You thirsty?"));

let response1 = new ResponseModule();

response1.addResponse(new Option("Hi there! Why dont i show you around town and you can get to know yourself? .. and I. lol.",0,0,0,[0]));

export default _dialogues;
