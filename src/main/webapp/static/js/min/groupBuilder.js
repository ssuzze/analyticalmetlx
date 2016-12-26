var GroupBuilder=function(){var p={},e=[],k={},l=[],d="byMaximumSize",q=!1,h={byTotalGroups:5,byMaximumSize:4},r=function(a){return $("<div />",{"class":"groupBuilderMember",text:a})},v=function(){var a=$(".jAlert .groupSlideDialog").find(".importGroups").empty();_.each(k,function(b){_.each(b,function(c){var b=c.orgUnit;if(b){p[b.name]&&p[b.name].remove();var b=p[b.name]=$("<div />",{text:b.name}).appendTo(a),f=0,u=c.groupSet,t=$("<div />",{}).appendTo(b);t.append("<div />",{"class":"groupCatName",
text:u.name});_.each(c.groups,function(a){f++;var b=$("<div />",{"class":"groupBuilderGroup",text:a.name}).appendTo(t),c=sprintf("structuralGroup_%s",f);$("<input />",{type:"checkbox",id:c}).on("click",function(){_.includes(e,a)?e=_.without(e,a):e.push(a);m()}).appendTo(b).prop("checked",_.includes(e,a));$("<label />",{"for":c}).append($("<span />",{"class":"icon-txt",text:"Copy"})).appendTo(b);_.each(a.members,function(a){r(a.name).appendTo(b)})})}})})},w=function(a,b,c){console.log(a,b,c);var g=
_.map(e,function(a){var b={};_.each(a.members,function(a){b[a.name]=!0});return b});switch(c){case "allPresent":c=Participants.getParticipants();break;default:c=Participants.getPossibleParticipants()}c=_.without(c,Conversations.getCurrentConversation().author);c=_.omitBy(c,function(a){return _.some(g,function(b){return a in b})});var f;switch(a){case "byTotalGroups":for(a=g.length;a<parseInt(b);a++)g.push({});f=function(a){_.sortBy(g,function(a){return _.keys(a).length})[0][a]=!0};break;case "byMaximumSize":f=
function(a){var c=_.find(g,function(a){return _.keys(a).length<parseInt(b)});c||(c={},g.push(c));c[a]=!0}}_.each(c,f);console.log(g);return _.map(g,_.keys)},x=function(a){_.each([["Show me all my enrolled students","allEnrolled"],["Only show me students who are here right now","allPresent"]],function(b){$("<option />",{text:b[0],value:b[1]}).appendTo(a)})},y=function(a){_.each([["there are","byTotalGroups"],["each has","byMaximumSize"]],function(b){$("<option />",{text:b[0],value:b[1]}).appendTo(a)})},
n=function(){var a=$("#groupsPopup");$("#groupComposition");a.find(".importGroups").empty();var b=a.find(".groups").empty(),c=Conversations.getCurrentSlide();c&&_.each(c.groupSets,function(a){_.each(_.sortBy(a.groups,"title"),function(f){var d=$("<div />",{"class":"groupBuilderGroup"}).appendTo(b).droppable({drop:function(b,d){var e=$(d.draggable).find(".groupBuilderMember").addBack(".groupBuilderMember");console.log("Dropped",$(d.draggable),e);_.each(e,function(b){var d=$(b).text();console.log("Drop member",
d);_.includes(f.members,d)||(_.each(a.groups,function(a){a.members=_.without(a.members,d)}),f.members.push(d),n(),Conversations.overrideAllocation(c))});b.preventDefault()}});$("<div />",{"class":"title",text:sprintf("Group %s",f.title)}).appendTo(d);_.each(f.members,function(a){r(a).appendTo(d).draggable()})})})},m=function(a){var b=$(".jAlert .groupSlideDialog").find(".groups");a=a||w(d,h[d],q);b.empty();_.each(a,function(c){console.log(c);var d=$("<div />",{"class":"groupBuilderGroup ghost"});
_.each(c,function(a){r(a).draggable().appendTo(d)});d.droppable({drop:function(b,d){var e=$(d.draggable).text();_.each(a,function(a){_.includes(a,e)&&a.splice(a.indexOf(e),1)});c.push(e);l=a;m(a);b.preventDefault()}});d.appendTo(b)})};Progress.groupProvidersReceived.GroupBuilder=function(a){var b=$(".jAlert .ouSelector").empty();$("<option />",{text:"no starting groups",value:"NONE",selected:!0}).appendTo(b);_.each(a.groupsProviders,function(a){$("<option />",{text:a,value:a}).appendTo(b)});b.on("change",
function(){var a=$(this).val();"NONE"!=a&&getOrgUnitsFromGroupProviders(a)})};Progress.groupsReceived.GroupBuilder=function(a){var b=k[a.orgUnit.name];void 0===b&&(b={},k[a.orgUnit.name]=b);b[a.groupSet.name]=a;v()};Progress.onBackstageShow.GroupBuilder=function(a){"groups"==a&&n()};Progress.currentSlideJidReceived.GroupBuilder=function(){"groups"==currentBackstage&&n()};Progress.conversationDetailsReceived.GroupBuilder=function(){"groups"==currentBackstage&&n()};return{showAddGroupSlideDialog:function(){getGroupsProviders();
var a=$("#groupSlideDialog").clone().show();$.jAlert({title:"Add Group page",width:"75%",content:a[0].outerHTML,btns:[{text:"Add page",theme:"green",closeAlert:!0,onClick:function(){var a=0<l.length?l:_.map(e,function(a){return _.map(a.members,"name")});Conversations.addGroupSlide(d,parseInt(h[d]),a);l=[];k={}}}]});var a=$(".jAlert .groupSlideDialog"),b=a.find(".strategySelect"),c=a.find(".parameterSelect"),g=a.find(".presentStudentsOnly");a.find(".groups");y(b);x(g);a.on("change",".presentStudentsOnly",
function(){q=$(this).val();console.log(q);m()});a.on("change",".strategySelect",function(){d=$(this).val();console.log("Strategy set:",d);c.empty();switch(d){case "byTotalGroups":_.each(_.range(2,10),function(a){$("<option />",{text:sprintf("%s groups in total",a),value:a.toString()}).appendTo(c)});c.val(h[d]).change();break;case "byMaximumSize":_.each(_.range(1,10),function(a){$("<option />",{text:1==a?"only one member":sprintf("at most %s members",a),value:a.toString()}).appendTo(c)}),c.val(h[d]).change()}});
a.on("change",".parameterSelect",function(){console.log("change parameter",h);h[d]=$(this).val();m()});b.val(d).change()}}}();
