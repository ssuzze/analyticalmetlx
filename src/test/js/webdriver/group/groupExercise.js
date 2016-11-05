var _ = require('lodash');
var assert = require('assert');
var board = require('../page/board.page');
var sprintf = require('sprintf-js').sprintf;

var LoginPage = require("../page/login.page");
var ConversationsPage = require("../page/conversations.page");
var ConversationPage = require("../page/conversation.page");

describe('When the class breaks into groups,', function() {
    var teacherName;
    var tT = board(teacher);
    var sA = board(studentA);
    var sB = board(studentB);
    var sC = board(studentC);
    var sD = board(studentD);
    var sE = board(studentE);
    var users = [tT,sA,sB,sC,sD,sE];

    var join = function(user,label){
        var login = LoginPage(user);
        var search = ConversationsPage(user);
        var username = sprintf(label);
        login.username.setValue(username);
        login.submit();
        assert(search.waitForSearchBox());
        switch(label){
        case 'teacher':
            teacherName = username;
            assert(search.waitForCreateButton());
            var previousConversations = search.getConversations();
            user.click("#createConversationButton");
            var newConversations = search.getNewConversations(previousConversations);
            assert.ok(newConversations.length > 0,"expected there to be at least 1 new conversation");
            user.click(".newConversationTag");
            break;
        default:
            user.setValue("#conversationSearchBox > input",'teacher');
            user.click("#searchButton");
            user.pause(1000);
            user.click(".newConversationTag");
            break;
        }
        user.waitForExist("#board");
    };
    it('given that everybody is in the application', function () {
        browser.url('/board');
        join(teacher,'teacher');
        join(studentA,'studentA');
        join(studentB,'studentB');
    });
    it("given that the teacher gives public instructions on the first slide",function(){
        tT.textMode.click();
        tT.keyboard(50,50,"Break into groups and discuss without sharing with other groups.  What is the best thing in life?");
    });
    it("the students should all see the instructions",function(){
        studentA.waitUntil(function(){
            return _.keys(sA.textStanzas).length == 1;
        });
        studentB.waitUntil(function(){
            return _.keys(sB.textStanzas).length == 1;
        });
    });
    it("given that the teacher adds a group slide",function(){
        assert.equal(tT.currentSlide.index,0);
        tT.addGroupSlide.click();
        teacher.waitUntil(function(){
            return tT.currentSlide.index == 1;
        });
    });
    it("the teacher should be taken to it",function(){
        assert.equal(tT.currentSlide.index,1);
    });
    it("the students should all follow to it",function(){
        assert.equal(sA.currentSlide.index,1);
        assert.equal(sB.currentSlide.index,1);
    });
    it("the students should all be split into groups",function(){
        var groupSet = tT.currentSlide.groupSet;
        assert.equal(groupSet.groups.length,2);
        var groupsByUser = _.reduce(groupSet.groups,function(acc,item){
            _.each(item.members,function(member){
                if(!(member in acc)){
                    acc[member] = 0;
                }
                acc[member] += 1;
            })
            return acc;
        },{});
        assert(_.every(groupsByUser,function(memberships){
            return memberships == 1;
        }));
    });
    it("the teacher does not join any group",function(){
        assert(_.every(tT.currentSlide.groupSet.groups,function(group){
            return !(_.some(group.members,teacherName));
        }));
    });
    it("students see the teacher work but not other groups",function(){
        _.each([tT,sA,sB],function(client,i){
            client.textMode.click();
            client.keyboard(50,100 + i * 100,"Phrase "+(i+1));
        });
        browser.pause(1500);//Let everything synchronize

        assert(_.includes(sA.plainTexts,"Phrase 1"));
        assert(_.includes(sB.plainTexts,"Phrase 1"));

        assert(_.includes(sA.plainTexts,"Phrase 2"));
        assert(!(_.includes(sB.plainTexts,"Phrase 2")));

        assert(! (_.includes(sA.plainTexts,"Phrase 3")));
        assert(_.includes(sB.plainTexts,"Phrase 3"));
    });
    it("the teacher can see all groups",function(){
        assert(_.includes(tT.plainTexts,"Phrase 1"));
        assert(_.includes(tT.plainTexts,"Phrase 2"));
        assert(_.includes(tT.plainTexts,"Phrase 3"));
    });
    it("the teacher can filter out groups but the students cannot",function(){
        tT.menuButton.click();
        sA.menuButton.click();
        sB.menuButton.click();
        browser.waitUntil(function(){return browser.isVisible("#roomToolbar");});

        tT.learning.click();
        sA.learning.click();
        sB.learning.click();
        browser.waitUntil(function(){return browser.isVisible("#menuContentFilter");});

        tT.contentFilter.click();
        sA.contentFilter.click();
        sB.contentFilter.click();

        var groups = tT.currentSlide.groupSet.groups;
        assert(teacher.isExisting("#contentFilter_"+groups[0].id));
        assert(teacher.isExisting("#contentFilter_"+groups[1].id));

        assert(! studentA.isExisting("#contentFilter_"+groups[0].id));
        assert(! studentA.isExisting("#contentFilter_"+groups[1].id));

        assert(! studentB.isExisting("#contentFilter_"+groups[0].id));
        assert(! studentB.isExisting("#contentFilter_"+groups[1].id));
    });
    it("connection health should be a visible metric",function(){
        assert(browser.isExisting("#healthStatus"));
        assert(tT.connectionHealth > 0);
    });
    it("participant presence should not be an active metric when the class is not restricted",function(){
        assert(browser.isExisting("#participationStatus"));
        assert.equal(tT.currentConversation.subject,"unrestricted");
        assert.equal(tT.participationHealth,0);
    });
    it("given that the teacher restricts the conversation",function(){
        tT.homeTab.click();
        tT.conversationSearch.click();
        teacher.click("=Edit");
        browser.waitUntil(function(){
            return teacher.isVisible("h1=Edit conversation");
        });
        teacher.click(".conversationSharingCollapser.course");
        teacher.click("label=Org Unit A");
        teacher.click(".joinConversation");
        teacher.waitForExist("#board");
        assert.equal(tT.currentConversation.subject,"Org Unit A");
        tT.nextSlide.click();
        teacher.waitUntil(function(){
            return tT.currentSlide.index == 1;
        });
    });
    it("participant presence should be measured against potential participants",function(){
        assert.equal(tT.participationHealthMax,6);
        assert.equal(tT.participationHealth,3);
        join(studentC,'studentC');
        studentC.waitForExist("#board");
        assert.equal(tT.participationHealth,4);
    });
    it("group restriction should apply to new entrants",function(){
        studentC.waitUntil(function(){
            return sC.currentSlide.index == 1;
        });
        var groups = sC.currentSlide.groupSet.groups;
        assert.equal(groups.length,3);
        sC.menuButton.click();
        studentC.waitUntil(function(){return studentC.isVisible("#roomToolbar");});
        sC.learning.click();
        studentC.waitUntil(function(){return studentC.isVisible("#menuContentFilter");});
        sC.contentFilter.click();

        assert(! studentC.isExisting("#contentFilter_"+groups[0].id));
        assert(! studentC.isExisting("#contentFilter_"+groups[1].id));
        assert(! studentC.isExisting("#contentFilter_"+groups[2].id));

        assert(_.includes(sC.plainTexts,"Phrase 1"));
        assert(!(_.includes(sC.plainTexts,"Phrase 2")));
        assert(!(_.includes(sC.plainTexts,"Phrase 3")));

	sC.menuButton.click();
        sC.textMode.click();
        sC.keyboard(50,4,"Phrase 4");
        browser.pause(1500);//Let everything synchronize
        assert(!(_.includes(sA.plainTexts,"Phrase 4")));
        assert(!(_.includes(sB.plainTexts,"Phrase 4")));
        assert(_.includes(sC.plainTexts,"Phrase 4"));
        assert(_.includes(tT.plainTexts,"Phrase 4"));
    });
    it("further entrants should be allocated into existing groups",function(){
        join(studentD,'studentD');
        studentD.waitForExist("#board");
        studentD.waitUntil(function(){
            return sD.currentSlide.index == 1;
        });
        console.log("Groups",sD.currentSlide.groupSet.groups);
        assert(_.includes(sD.plainTexts,"Phrase 1"));
        assert(!(_.includes(sD.plainTexts,"Phrase 2")));
        assert(!(_.includes(sD.plainTexts,"Phrase 3")));
        assert(_.includes(sD.plainTexts,"Phrase 4"));
        join(studentE,'studentE');
        studentE.waitForExist("#board");
        studentE.waitUntil(function(){
            return sE.currentSlide.index == 1;
        });
	console.log(sE.plainTexts);
        assert(_.includes(sE.plainTexts,"Phrase 1"));
        assert(!(_.includes(sE.plainTexts,"Phrase 2")));
        assert(_.includes(sE.plainTexts,"Phrase 3"));
    });
    it("all content types should be group restricted",function(){
	_.each(users,function(user){console.log(user.applicationMenu)});
    });
    it("expressive complexity should be a visible metric",function(){
        assert(browser.isExisting("#complexityStatus"));
    });
});
