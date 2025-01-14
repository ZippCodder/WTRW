import {
    random
} from "/src/scripts/lib.js";

const _dialogues = {
    defaultOptions: []
};

// AVATAR: rep = reputation, con = confidence  CHARACTER: rel = relationship, agr = agreeableness

class Option {
    constructor(content, con = 0, rep = 0, rel = 0, dest, label, action, disable) {
        this.content = content;
        this.dest = dest;
        this.con = con;
        this.rep = rep;
        this.rel = rel;
        this.action = action;
        this.enabled = !disable;
        this.label = label;
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
        _dialogues[String(Object.keys(_dialogues).length - 1)] = this;
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
        _dialogues[String(Object.keys(_dialogues).length - 1)] = this;
    }

    addResponse(response) {
        this.responses.push(response);
    }
}

class Phrase {
    constructor(phrases) {
        this.phrases = phrases;
    }

    getPhrase() {
        return this.phrases[random(this.phrases.length)].content;
    }
}

_dialogues.defaultOptions.push(new Option("...", 0, 0, 0, false, "[exit]", function() {
    endDialogue();
}));

let begging = new Phrase([new Option("Got any cash?", 0, 0, 0, [0, 0]), new Option("Hi! Spare some change?", 0, 0, 0, [0, 0]), new Option("Hey, do you have any change on you?", 0, 0, 0, [0, 0])]);

let g1 = new OptionModule();
g1.addOption(new Option(function() {
    return begging.getPhrase();
}, 0, 0, 0, [1, 0], "[beg for money]"));

let beggingResponse = new Phrase([new Option("Fuck off!", 0, 0, 0, [0, 0]), new Option("Sorry, I don't have anything on me.", 0, 0, 0, [0, 0]), new Option("Leave me alone, druggie.", 0, 0, 0, [0, 0]), new Option("I don't carry cash man.", 0, 0, 0, [0, 0]), new Option("Go get a job...", 0, 0, 0, [0, 0])]);

let g2 = new ResponseModule();
g2.addResponse(new Option(function() {
    return beggingResponse.getPhrase();
}, 0, 0, 0, [0, 0]));

export default _dialogues;