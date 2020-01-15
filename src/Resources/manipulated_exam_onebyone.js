//æ›¿ä»£ES6includesè¯­æ³•
function inArray(search,array){
    for(var i in array){
        if(array[i]==search){
            return true;
        }
    }
    return false;
}
$(function () {
    var getExamEndTimeInterval; //èŽ·å–è€ƒè¯•æ—¶é—´çš„å®šæ—¶å™¨ï¼Œåœ¨äº¤å·åŽéœ€è¦æ¸…é™¤è¯¥å®šæ—¶å™¨
    var questionsNumList = []; //æ‰€æœ‰è¯•é¢˜idç´¢å¼•
    var questionNumStorage = []; // å½“å‰å·²ç»ç¼“å­˜çš„è¯•é¢˜idæ•°ç»„ æœ€å¤§ä¸º30é“
    var temporaryData = null; // å½“å‰å·²ç»ç¼“å­˜çš„è¯•é¢˜æ•°æ®å¯¹è±¡
    //è¿›é¡µé¢æ¸…é™¤æœ¬åœ°å­˜å‚¨å·²æœ‰çš„è¯•é¢˜ç¼“å­˜
    if(window.localStorage.getItem("questionNumber")) {
        window.localStorage.removeItem("questionNumber");
    }
    //ç­”é¢˜è¿›åº¦
    function commitProcess(id, status) {
        //id: è¯•é¢˜idï¼Œstatusï¼štrueç­”é¢˜ï¼Œfalseå–æ¶ˆ
        var commitLength, totalLength;
        if(status){
            $("#numberCardModal a.questions_"+id).parent(".box").removeClass("s1").addClass("s2");
            $(".question-content[data-id="+id+"]").attr("data-commit", "true");
        }else {
            $("#numberCardModal a.questions_"+id).parent(".box").removeClass("s2").addClass("s1");
            $(".question-content[data-id="+id+"]").attr("data-commit", "false");
        }
        commitLength = $("#numberCardModal .modal-body .box.s2").length;
        totalLength = $("#numberCardModal .modal-body .box.question_cbox").length;

        $("#commitCount").text(commitLength);
        $("#totalCount").text(totalLength);
        $("#commitProcess").css({
            width: commitLength*100/totalLength + 'px'
        });
    }

    //èŽ·å–æ‰€æœ‰é¢˜çš„id
    $("#numberCardModal .iconBox").each(function(index, element) {
        questionsNumList.push($(this).attr("questionsid"));
    })

    //å¦‚æžœæ˜¯å•é¢˜é™åˆ¶æ—¶é•¿æˆ–é—¯å…³æ¨¡å¼ï¼Œç¦æ­¢æµè§ˆå™¨å›žé€€
    if (perTimeRestrict == "-1" || passMode == "-1"){
        if (window.history && window.history.pushState) {
            $(window).on('popstate', function () {
                window.history.pushState('forward', null, '#');
                window.history.forward(1);
            });
        }
        window.history.pushState('forward', null, '#'); //åœ¨IEä¸­å¿…é¡»å¾—æœ‰è¿™ä¸¤è¡Œ
        window.history.forward(1);
    }

    //æ˜¾ç¤ºæ°´å°
    if(typeof isWatermark != 'undefined' && isWatermark == '1'){
        $.ajax({
            type: "GET",
            cache: false,
            headers: {"cache-control": "no-cache"},
            dataType: "json",
            url: "/course/get_watermark",
            success: function (msg) {
                if(msg.success){
                    $(".exam-question-wrapper .question-content").css({
                        'background-image': 'url('+msg.bizContent+')'
                    });
                    $(".question-content-wrapper .question-content").css({
                        'background-image': 'url('+msg.bizContent+')'
                    });
                }
            }
        });
    }
    var analysis, test_ans_right, perTimer;//å»¶æ—¶å™¨;
    var functionObj = {};//è¿™ä¸ªå¯¹è±¡ä¸»è¦æ˜¯å› ä¸ºè¦è®¿é—®å…¶å®ƒä½œç”¨åŸŸçš„å˜é‡


    // äº¤å·æ—¶é—´
    var d = new Date();
    var initTime = parseInt(d.getTime()/1000);
    //è€ƒè¯•ç»“æŸæ—¶é—´ç‚¹
    var endTime = initTime + answer_time_left*5;


    //è®¡æ—¶
    $(function () {

        //  è€ƒè¯•æ—¶é—´å€’è®¡æ—¶
        // éž"æ¯é¢˜é™åˆ¶æ—¶é•¿ && "éž"ä¸é™æ—¶é•¿"ç±»çš„è€ƒè¯•ï¼ŒèŽ·å–å€’è®¡æ—¶
        if(perTimeRestrict != "1" && examTimeRestrict != "-1") {
            timeDownInterval = setInterval(timeDown, 1000);
        }

        //å€’è®¡æ—¶
        function timeDown(){
            var t = new Date();
            var nowTime = parseInt(t.getTime()/1000);
            var leftTime = endTime - nowTime;

            if(leftTime<=0){
                $("#timeDown").removeClass("warning");
                $("#timeDown").text("å³å°†äº¤å·");
                //å¡«ç©ºé—®ç­”å¼ºåˆ¶å¤±ç„¦ä¿å­˜
                $(".keyCloze").blur();
                $(".keyFill").blur();

                alert("è€ƒè¯•æ—¶é—´åˆ°ï¼");
                saveExamFn(0);
            }

            answer_time_left = answer_time_left - 1;

            // if(answer_time_left==10){
            //     $("#timeDown").addClass("warning");
            // }

            $("#timeDown").text(formatTime(leftTime));

        }

    });
    //æ¯é¢˜é™åˆ¶ç­”é¢˜æ—¶é•¿
    function perTimeDown(pertime) {
        var time = pertime?pertime:0;
        time = parseInt(time)+1;//å‡å°‘åŠ è½½é¢˜ç›®æŸè€—çš„æ—¶é—´
        var intervalTime = 100;
        $("#remainingTime").text(formatTime(time));
        var createPerTimer = function() {
            clearTimeout(perTimer);
            time = time - 1;
            if(time < 0){
                //å¦‚æžœä¸æ˜¯æœ€åŽä¸€é“é¢˜ï¼Œç›´æŽ¥è¿›å…¥ä¸‹ä¸€é¢˜ï¼›å¦åˆ™äº¤å·
                if(!$("#nextQuestions").hasClass("disabled")){
                    functionObj.nextQuestionEvent();
                    //é˜»æ­¢å¤šæ¬¡è§¦å‘
                    $("#nextQuestions").addClass("cannot-click");
                    var clickTimeout = setTimeout(function(){
                        $("#nextQuestions").removeClass("cannot-click");
                        clearTimeout(clickTimeout);
                    },1000);
                }else {
                    saveExamFn(0);
                    //äº¤å·ä¹‹åŽéšè—æ‰€æœ‰æç¤º
                    $("#timeLimitAlert").addClass("hidden");
                    $("#blurCountModal").modal('hide');
                    $("#endExamModal").modal('hide');
                    //æ¸…é™¤å®šæ—¶å™¨
                    clearTimeout(perTimer);
                    $('.loading-box').removeClass('hidden');
                    $("#remainingTime").remove();
                }
                return false;
            }
            $("#remainingTime").text(formatTime(time));
            perTimer = setTimeout(function () {
                createPerTimer();
            }, 1000);
        }
        createPerTimer();
    }

    //å¿ƒè·³é“¾æŽ¥
    $(function () {
        // æ¯30ç§’è¯·æ±‚ä¸€æ¬¡è€ƒè¯•æ—¶é—´
        // "éž"ä¸é™æ—¶é•¿"ç±»çš„è€ƒè¯•ï¼ŒèŽ·å–å€’è®¡æ—¶
        if(perTimeRestrict == "-1" || examTimeRestrict != "-1") {
            getExamEndTimeInterval = setInterval(heartAjax, 30000);
        }
        // å¿ƒè·³é“¾æŽ¥ï¼Œè¯·æ±‚è€ƒè¯•æ—¶é—´
        function heartAjax() {
            //ä¸æ˜¾ç¤ºloading
            $("#spinnerLoading").addClass("hide");

            $.ajax( {
                type:"post",
                url:"/exam/getExamEndTime",
                dataType:"json",
                data: "userId="+examUserId+"&examInfoId="+exam_info_id+"&examResultId="+exam_results_id,
                success:function(msg){
                    //ä¸æ˜¾ç¤ºloading
                    $("#spinnerLoading").removeClass("hide");

                    if(msg.success){
                        //code:0 æœªè®¾ç½®ï¼Œä¸æ“ä½œ
                        //code:1 é‡æ–°è®¾ç½®æ—¶é—´
                        //code:2 ç«‹å³äº¤å·
                        if(msg.bizContent.code=='3'){

                            $('.submit-notice').show();

                            var endNum = 3;
                            var submitExam = setInterval(function(){
                                endNum--;
                                if(endNum < 0){
                                    clearInterval(submitExam);
                                    $('.submit-notice').hide();
                                    saveExamFn(6);//ç«‹å³äº¤å·
                                }
                                $('.notice-time').text(endNum)
                            },1000);
                        }
                        if(msg.bizContent.code=='1'){

                            if(answer_time_left!=msg.bizContent.totalTime){
                                d = new Date();
                                initTime = parseInt(d.getTime()/1000);

                                answer_time_left = msg.bizContent.totalTime;
                                endTime = initTime + answer_time_left;

                                $("#timeResetModal .delay-time").text(msg.bizContent.delayTimeStamp);
                                $('#timeResetModal').modal();
                            }
                        }else if(msg.bizContent.code=='2'){
                            saveExamFn(0);
                        }
                    }else{
                        console.log(msg.desc);
                    }
                },
                error: function (msg) {
                    //ä¸æ˜¾ç¤ºloading
                    $("#spinnerLoading").removeClass("hide");
                }

            });
        }
    });

    // æ ¼å¼åŒ–æ—¶é—´
    function formatTime(time, decimal) {
        var day = Math.floor(time/86400);
        var day_left=time-86400*day;
        var hour = Math.floor(day_left/3600);
        var hour_left=day_left-3600*hour;
        var minutes= Math.floor(hour_left/60);
        var seconds= hour_left-60*minutes;
        //åˆ¤æ–­secondsæ˜¯å¦ä¸ºå°æ•°
        var msec = Math.floor(time) === time ? "0" : Number(time).toFixed(1).toString().split(".")[1];
        seconds = parseInt(seconds);
        var time_show=(day==0?'':(day+'å¤©:'))+(hour<10?'0'+hour:hour)+':'+(minutes<10?'0'+minutes:minutes)+
            ':'+(seconds<10?'0'+seconds:seconds)+(decimal?':'+msec+'0':'');

        return time_show;
    }


    //**************************************èŽ·å–è¯•é¢˜**************************************
    $(function () {
        //å½“å‰ç»„åˆé¢˜id,è§£æž,æ­£ç¡®ç­”æ¡ˆ
        var current_comb_id;

        //ç¬¬ä¸€é“é¢˜åˆå§‹åŒ–
        //å¦‚æžœæ˜¯æ¯é¢˜é™åˆ¶æ—¶é•¿ï¼Œå¹¶ä¸”æ˜¯å†æ¬¡è¿›å…¥è€ƒè¯• doing
        if(perTimeRestrict == "-1" && currentTestId != "") {
            //è®¡ç®—currentTestIdçš„ä¸Šä¸€é“é¢˜çš„id
            $("#numberCardModal .iconBox").each(function(index, element) {
                if($(this).attr("questionsId")==currentTestId){
                    if(index == 0){
                        loadQuestionsFn("", "");
                        return;
                    }else{
                        currentTestId = $($("#numberCardModal .iconBox")[index-1]).attr("questionsId");
                        loadQuestionsFn(currentTestId,"next");
                        return;
                    }
                }
            });
        }else if(passMode == "1" && currentTestId != ""){
            loadQuestionsFn(currentTestId,"next");
        }else {
            //æ¯æ¬¡è¿›å…¥éƒ½ä¼šæ£€æµ‹æœ€åŽä¸€é“å·²ç­”é¢˜å¹¶è·³è½¬
            var jumpCurrentId = "";
            for (var i= $("#numberCardModal .iconBox").length-1;i>=0;i--){
                if($($("#numberCardModal .iconBox")[i]).parent().hasClass('s2')) {
                    if(i == 0) {
                        break; 
                    } else {
                        jumpCurrentId = $($("#numberCardModal .iconBox")[i-1]).attr("questionsId");
                        break;
                    }
                }
            }
            if(jumpCurrentId) {
                loadQuestionsFn(jumpCurrentId,"next");
            } else {
                loadQuestionsFn("", "");
            }
            
        }
        
        //ä¸Šä¸€é¢˜
        $("#preQuestions").click(function(e) {
            if(!$(this).hasClass("disabled")){
                loadQuestionsFn($(this).attr("nowId"),"pre");
            }
        });

        //ä¸ºäº†é˜²æ­¢æ— æ“ä½œå€’è®¡æ—¶å’Œæ¯é¢˜é™åˆ¶æ—¶é•¿è€ƒè¯•å†²çª
        //æ— æ“ä½œå€’è®¡æ—¶ä¼šç›‘å¬clickäº‹ä»¶ï¼Œå› æ­¤æ¯é¢˜é™åˆ¶æ—¶é•¿è€ƒè¯•è·³è½¬ä¸‹ä¸€é¢˜æ—¶ï¼Œä¸èƒ½ä½¿ç”¨ $("#nextQuestions").click()ï¼›
        //è¯¥äº‹ä»¶å®Œå…¨åŒäºŽnextQuestionçš„clickäº‹ä»¶
        functionObj.nextQuestionEvent = function() {
            var _this = $("#nextQuestions");
            if(!_this.hasClass("disabled")){
                //æ¯é¢˜é™åˆ¶æ—¶é•¿
                if(perTimeRestrict == "-1"){
                    if(_this.hasClass("cannotClick")){
                        return false;
                    }
                    $("#remainingTime").text("");
                    clearTimeout(perTimer);
                }
                //å¦‚æžœæ˜¯é—¯å…³æ¨¡å¼ï¼Œå…ˆè¯·æ±‚åˆ¤åˆ†æŽ¥å£å†åŠ è½½ä¸‹ä¸€é¢˜
                if(passMode == "1"){
                    var questionsId = $(".questions-content").attr("questionsId");
                    var card_dom = $(".questions_"+questionsId).parent(".box");
                    var comb_id='', dataForm, perScore;
                    perScore = $(".questions-content").attr("perScore");
                    if($(card_dom).hasClass("insert-box")){
                        comb_id = $(card_dom).parent(".insert-list").attr("questionsId");
                        dataForm = "examResultsId="+exam_results_id+"&testId="+questionsId+"&examInfoId="+exam_info_id+"&combId="+comb_id+"&perScore="+perScore;
                    }else {
                        dataForm = "examResultsId="+exam_results_id+"&testId="+questionsId+"&examInfoId="+exam_info_id+"&perScore="+perScore;
                    }
                    if(questionsId.indexOf('delete')!=-1) {
                        loadQuestionsFn(_this.attr("nowId"), "next");
                    }else {
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url: "/exam/pass_mode/mark_question/",
                            data: dataForm,
                            success: function (msg) {
                                //æ£€æµ‹ç­”é¢˜ä¸Šé™
                                if (msg.bizContent.errCount > parseInt(errorTimes)) {
                                    saveExamFn(4);
                                    $('.loading-exam-fail').show();
                                    $('.loading-exam-success').hide();
                                    $('.loading-box').removeClass('hidden');
                                    $('#spinnerLoading').addClass('hide');
                                    return false;
                                }

                                if (msg.bizContent.isCorrect === '0') {
                                    $('.exam-shake-left,.exam-shake-right').show();
                                    $('.exam-error-num span').text($('.exam-error-num span').text() - 1).css('color', '#FF4B50');
                                    $('.exam-error-num').addClass('sweat-shake').css('backgroundImage', 'https://s0.kaoshixing.com/static/exam/images/competition/m_img_heart_red.png');
                                    _this.find('.item-label').hide();
                                    _this.find('.icon-m_prompt_error1').show();
                                    _this.attr('disabled', true);
                                    //å½“é—¯å…³å¤±è´¥ç­”é”™æ—¶æ›´æ–°æ‰€æœ‰ç¼“å­˜
                                    temporaryData = JSON.parse(window.localStorage.getItem("questionNumber"));
                                    for(var i in temporaryData) {
                                        temporaryData[i].errCount = msg.bizContent.errCount;
                                    }
                                    window.localStorage.setItem("questionNumber", JSON.stringify(temporaryData));
                                    setTimeout(function () {
                                        $('.exam-shake-left,.exam-shake-right').hide();
                                        $('.exam-error-num span').css('color', ' #27274A');
                                        $('.exam-error-num').removeClass('sweat-shake').css('backgroundImage', 'https://s0.kaoshixing.com/static/exam/images/competition/m_img_heart_red.png');
                                        _this.find('.item-label').show();
                                        _this.find('.icon-m_prompt_error1').hide();
                                        _this.attr('disabled', false);
                                    }, 800);
                                } else {
                                    _this.find('.item-label').hide();
                                    _this.find('.icon-m_prompt_correct1').show();
                                    _this.attr('disabled', true);
                                    setTimeout(function () {
                                        _this.find('.item-label').show();
                                        _this.find('.icon-m_prompt_correct1').hide();
                                        _this.attr('disabled', false);
                                    }, 1000)
                                }
                                loadQuestionsFn(_this.attr("nowId"), "next");
                            }
                        });
                    }
                }else {
                    loadQuestionsFn(_this.attr("nowId"),"next");
                }
            }
        }
        //ä¸‹ä¸€é¢˜
        $("#nextQuestions").click(function(e) {
            var _this = $(this);
            if(!_this.hasClass("disabled")){

                        //æ¯é¢˜é™åˆ¶æ—¶é•¿
                        if(perTimeRestrict == "-1"){
                            if(_this.hasClass("cannotClick")){
                                return false;
                            }
                            $("#remainingTime").text("");
                            clearTimeout(perTimer);
                        }
                        //å¦‚æžœæ˜¯é—¯å…³æ¨¡å¼ï¼Œå…ˆè¯·æ±‚åˆ¤åˆ†æŽ¥å£å†åŠ è½½ä¸‹ä¸€é¢˜
                        if(passMode == "1"){

                            var questionsId = $(".questions-content").attr("questionsId");
                            var card_dom = $(".questions_"+questionsId).parent(".box");
                            var comb_id='', dataForm, perScore;
                            perScore = $(".questions-content").attr("perScore");
                            if($(card_dom).hasClass("insert-box")){
                                comb_id = $(card_dom).parent(".insert-list").attr("questionsId");
                                dataForm = "examResultsId="+exam_results_id+"&testId="+questionsId+"&examInfoId="+exam_info_id+"&combId="+comb_id+"&perScore="+perScore;
                            }else {
                                dataForm = "examResultsId="+exam_results_id+"&testId="+questionsId+"&examInfoId="+exam_info_id+"&perScore="+perScore;
                            }
                            if(questionsId.indexOf('delete')!=-1) {
                                loadQuestionsFn(_this.attr("nowId"), "next");
                            }else {
                                $.ajax({
                                    type: "POST",
                                    dataType: "json",
                                    url: "/exam/pass_mode/mark_question/",
                                    data: dataForm,
                                    success: function (msg) {
                                        //æ£€æµ‹ç­”é¢˜ä¸Šé™
                                        if (msg.bizContent.errCount > parseInt(errorTimes)) {
                                            saveExamFn(4);
                                            $('.loading-exam-fail').show();
                                            $('.loading-exam-success').hide();
                                            $('.loading-box').removeClass('hidden');
                                            $('#spinnerLoading').addClass('hide');
                                            return false;
                                        }
                                        //æ£€æµ‹ç­”æ¡ˆæ˜¯å¦æ­£ç¡®
                                        if (msg.bizContent.isCorrect === '0') {
                                            $('.exam-shake-left,.exam-shake-right').show();
                                            $('.exam-error-num span').text($('.exam-error-num span').text() - 1).css('color', '#FF4B50');
                                            $('.exam-error-num').addClass('sweat-shake').css('backgroundImage', '/static/exam/images/competition/m_img_heart_red.png');
                                            _this.find('.item-label').hide();
                                            _this.find('.icon-m_prompt_error1').show();
                                            _this.attr('disabled', true);

                                            //å½“é—¯å…³å¤±è´¥ç­”é”™æ—¶æ›´æ–°æ‰€æœ‰ç¼“å­˜
                                            temporaryData = JSON.parse(window.localStorage.getItem("questionNumber"));
                                            for(var i in temporaryData) {
                                                temporaryData[i].errCount = msg.bizContent.errCount;
                                            }
                                            window.localStorage.setItem("questionNumber", JSON.stringify(temporaryData));


                                            setTimeout(function () {
                                                $('.exam-shake-left,.exam-shake-right').hide();
                                                $('.exam-error-num span').css('color', ' #27274A');
                                                $('.exam-error-num').removeClass('sweat-shake').css('backgroundImage', '/static/exam/images/competition/m_img_heart_de.png');
                                                _this.find('.item-label').show();
                                                _this.find('.icon-m_prompt_error1').hide();
                                                _this.attr('disabled', false);
                                            }, 800);

                                        } else {
                                            _this.find('.item-label').hide();
                                            _this.find('.icon-m_prompt_correct1').show();
                                            _this.attr('disabled', true);
                                            setTimeout(function () {
                                                _this.find('.item-label').show();
                                                _this.find('.icon-m_prompt_correct1').hide();
                                                _this.attr('disabled', false);
                                            }, 1000)
                                        }
                                        loadQuestionsFn(_this.attr("nowId"), "next");
                                    }
                                });
                            }
                        }else {
                            loadQuestionsFn(_this.attr("nowId"),"next");
                        }

            }

        });

        //æ ¹æ®é¢˜å·æ˜¾ç¤ºè¯•é¢˜
        $("#numberCardModal a.iconBox").click(function(e) {
            var nowId = $(this).attr("questionsId");
            $("#numberCardModal .iconBox").each(function(index, element) {
                if($(this).attr("questionsId")==nowId){
                    if(index==0){
                        return loadQuestionsFn("","",true);
                    }else{
                        nowId = $($("#numberCardModal .iconBox")[index-1]).attr("questionsId");
                        return loadQuestionsFn(nowId,"next",true);
                    }
                }
            });
            $("#numberCardModal").modal('hide');
        });

        //ç‚¹å‡»æŸ¥çœ‹è§£æžæŒ‰é’®
        $("#checkAnalysis").click(function(){
            check_analysis();
            show_analysis();
            var question_type=$('.answers').find('[data-type]').attr('data-type');
            var questionId = $(this).attr("nowid");
            if(question_type=="1"||question_type=="2"||question_type=="3"){
                type123save(1);
            }else if (question_type=="4") {
                type4save(1);
            }

            temporaryData = JSON.parse(window.localStorage.getItem("questionNumber"));
            if(temporaryData[questionId]) {
                temporaryData[questionId].checked_analysis = 1;
                window.localStorage.setItem("questionNumber", JSON.stringify(temporaryData));
            }
        });
        //å¼‚æ­¥è¯»å–è¯•é¢˜fn
        function loadQuestionsFn(nowId,step,point){
            //æŒ‡å‘è¦åŠ è½½è¯•é¢˜å¯¹åº”çš„ç­”é¢˜å¡iconbox
            var _this;
            //è¯•é¢˜id
            var questionsId = '';
            //å½“å‰è¦æŸ¥è¯¢çš„è¯•é¢˜idç»„
            var questionsIds = '';
            //ç»„åˆé¢˜è¯•é¢˜id
            var parentId = '';
            //æ¯é¢˜å€’è®¡æ—¶
            var time,perScore;

            if(nowId==""){
                _this = $("#numberCardModal .iconBox")[0];
                questionsId = $(_this).attr("questionsId");
                if(point) {
                    questionsIds = questionsId;
                } else {
                    var temporaryIds = questionsNumList.length>10?questionsNumList.slice(0,10):questionsNumList;
                    questionsIds = temporaryIds.join(',');
                }

                $(".questions-content").attr("questionsId",questionsId);
                time = $(_this).attr("timeInterval");
                perScore = $(_this).attr("perScore");
                if($(_this).parent(".box").hasClass("insert-box")){
                    parentId = $(_this).parents(".insert-list").attr("questionsId");
                }
                return loadFn(questionsId, 0, parentId, perScore, time, questionsIds);
            }else {
                $("#numberCardModal .iconBox").each(function(index, element) {
                    if($(this).attr("questionsId")==nowId){
                        if(step=="pre"){
                            _this = $($(".iconBox")[index-1]);
                            questionsId = $(_this).attr("questionsId");
                            if(point) {
                                questionsIds = questionsId;
                            } else {
                                if(!inArray(questionsId,questionNumStorage) ) {
                                    if(index-11 > 0){
                                        questionsIds = questionsNumList.slice(index-10, index);
                                    } else {
                                        questionsIds = questionsNumList.slice(0,index);
                                    }
                                }
                            }
                            $(".questions-content").attr("questionsId",questionsId);
                            time = $(_this).attr("timeInterval");
                            perScore = $(_this).attr("perScore");
                            parentId = $(_this).parents(".insert-list").length==1?$(_this).parents(".insert-list").attr("questionsId"):'';
                        }else{
                            _this = $($(".iconBox")[index+1]);
                            questionsId = $(_this).attr("questionsId");
                            if(point) {
                                questionsIds = questionsId;
                            } else {
                                if(!inArray(questionsId,questionNumStorage)) {
                                    if(index + 11 < $(".iconBox").length - 1){
                                        questionsIds = questionsNumList.slice(index+1, index+11);
                                    } else {
                                        questionsIds = questionsNumList.slice(index+1);
                                    }
                                }
                            }
                            $(".questions-content").attr("questionsId",questionsId);
                            time = $(_this).attr("timeInterval");
                            perScore = $(_this).attr("perScore");
                            parentId = $(_this).parents(".insert-list").length==1?$(_this).parents(".insert-list").attr("questionsId"):'';
                        }
                        //åˆ¤æ–­ç¬¬ä¸€é¢˜æˆ–æœ€åŽä¸€é¢˜
                        var num = "";
                        if(index==1&&step=="pre"){
                            num = 0;
                        }else if((index+2)==$(".iconBox").length && step!="pre"){
                            num = 1;
                        }
                        return loadFn(questionsId,num,parentId,perScore,time,questionsIds);
                    }
                });
            }
        }
        
        
        // æ¯é¢˜é™åˆ¶æ—¶é•¿æ—¶ç‚¹å‡»ä¸‹ä¸€é¢˜å­˜å‚¨å½“å‰è¦æ¸²æŸ“çš„è¯•é¢˜id
        function questionDruations(testID) {

            var dataForm = "examResultsId="+exam_results_id+"&testID="+testID

            $.ajax({
                type: "POST",
                dataType: "json",
                url: "/exam/set_redise_to_LastTestID",
                data: dataForm,
                success: function(msg){

                }
            });

        }
        
        // è¯»å–è¯•é¢˜æ•°æ®
        function loadFn(questionsId,index,combId,perScore,time, questionsIds){

            var specialQuestion = false;

            if(perTimeRestrict == "-1") {
                questionDruations(questionsId);
            }

            $(".question-content .answers").removeClass("hidden");

            var card_dom = $(".questions_"+questionsId).parent(".box");
            var comb_id='', dataForm;
            if($(card_dom).hasClass("insert-box")){
                specialQuestion = true;
                comb_id = $(card_dom).parent(".insert-list").attr("questionsId");
                dataForm = "examResultsId="+exam_results_id+"&testIds="+questionsId+"&examInfoId="+exam_info_id+"&combId="+comb_id;
            }else {
                dataForm = "examResultsId="+exam_results_id+"&testIds="+questionsIds+"&examInfoId="+exam_info_id;
            }

            if(!specialQuestion && window.localStorage.getItem("questionNumber")) {
                temporaryData = JSON.parse(window.localStorage.getItem("questionNumber"));

                if(temporaryData[questionsId]) {
                    return loadFnQuestion(temporaryData[questionsId], index,combId,perScore,time,questionsId);
                } else {

                    if (practice_mode=='1'){

                        //ç»ƒä¹ æ¨¡å¼
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url: "/exam/get_question_info/",
                            data: dataForm,
                            success: function(msg){


                                $.each(msg,function(){
                                    if(questionNumStorage.length >= 30) {
                                        delete  temporaryData[questionNumStorage[0]];
                                        questionNumStorage.shift();
                                        if(!inArray(this.test_id,questionNumStorage)){
                                            questionNumStorage.push(this.test_id)
                                        }

                                    } else {
                                        if(!inArray(this.test_id,questionNumStorage)){
                                            questionNumStorage.push(this.test_id)
                                        }
                                    }
                                    temporaryData[this.test_id] = this;
                                })

                                window.localStorage.setItem("questionNumber", JSON.stringify(temporaryData));
                                loadFnQuestion(temporaryData[questionsId],index,combId,perScore,time,questionsId);
                            }
                        });
                    }else {
                        //éžç»ƒä¹ æ¨¡å¼åªèŽ·å–è¯•é¢˜ä¿¡æ¯
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url: "/exam/get_one_by_one_exam_question_info/",
                            data: dataForm,
                            success: function(msg){
                                $.each(msg,function(){
                                    if(questionNumStorage.length >= 30) {
                                        delete  temporaryData[questionNumStorage[0]];
                                        questionNumStorage.shift();
                                        if(!inArray(this.test_id,questionNumStorage)){
                                            questionNumStorage.push(this.test_id)
                                        }
                                        temporaryData[this.test_id] = this;
                                    } else {
                                        if(!inArray(this.test_id,questionNumStorage)){
                                            questionNumStorage.push(this.test_id)
                                        }
                                        temporaryData[this.test_id] = this;
                                    }
                                })
                                window.localStorage.setItem("questionNumber", JSON.stringify(temporaryData));
                                loadFnQuestion(temporaryData[questionsId],index,combId,perScore,time,questionsId);
                            }
                        });
                    }

                }
            } else {
                if(window.localStorage.getItem("questionNumber")) temporaryData = JSON.parse(window.localStorage.getItem("questionNumber"));

                if (practice_mode=='1'){

                    //ç»ƒä¹ æ¨¡å¼
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: "/exam/get_question_info/",
                        data: dataForm,
                        success: function(msg){
                            if(temporaryData == null ) temporaryData = {};

                                $.each(msg,function(){
                                    if(questionNumStorage.length >= 30) {
                                        delete  temporaryData[questionNumStorage[0]];
                                        questionNumStorage.shift();
                                        if(!inArray(this.test_id,questionNumStorage)){
                                            questionNumStorage.push(this.test_id)
                                        }
                                        temporaryData[this.test_id] = this;
                                    } else {
                                        if(!inArray(this.test_id,questionNumStorage)){
                                            questionNumStorage.push(this.test_id)
                                        }
                                        temporaryData[this.test_id] = this;
                                    }
                                })



                            window.localStorage.setItem("questionNumber", JSON.stringify(temporaryData));
                            loadFnQuestion(temporaryData[questionsId],index,comb_id,perScore,time,questionsId);
                        }
                    });
                }else {
                    //éžç»ƒä¹ æ¨¡å¼åªèŽ·å–è¯•é¢˜ä¿¡æ¯
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: "/exam/get_one_by_one_exam_question_info/",
                        data: dataForm,
                        success: function(msg){
                            if(temporaryData == null ) temporaryData = {};

                                $.each(msg,function(){

                                    if(questionNumStorage.length >= 30) {
                                        delete  temporaryData[questionNumStorage[0]];
                                        questionNumStorage.shift();
                                        if(!inArray(this.test_id,questionNumStorage)){
                                            questionNumStorage.push(this.test_id)
                                        }
                                        temporaryData[this.test_id] = this;
                                    } else {
                                        if(!inArray(this.test_id,questionNumStorage)){
                                            questionNumStorage.push(this.test_id)
                                        }
                                        temporaryData[this.test_id] = this;
                                    }
                                })


                            window.localStorage.setItem("questionNumber", JSON.stringify(temporaryData));
                            loadFnQuestion(temporaryData[questionsId],index,comb_id,perScore,time,questionsId);
                        }
                    });
                }
            }

        }

        //è¯•é¢˜åŠ è½½
        function loadFnQuestion(msg,index,combId,perScore,time,questionsId){
            if (practice_mode=='1'){
                if(msg.test_ans_right) {
                    test_ans_right = msg.test_ans_right;
                    if ((msg.type == '1' || msg.type == '2') && msg.optionsDisorder == 1) {
                        var keyArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
                        var keyIndex, answerIndex, shuffleAns;

                        test_ans_right = test_ans_right.split("");

                        for (var j = 0; j < test_ans_right.length; j++) {
                            for (var i = 1; i < 21; i++) {
                                keyIndex = keyArray[i - 1];
                                answerIndex = 'answer' + i;
                                shuffleAns = msg[answerIndex];

                                if (test_ans_right[j] == keyIndex) {
                                    test_ans_right[j] = shuffleAns;
                                }
                            }
                        }
                        test_ans_right = test_ans_right.join("ï¼Œ");
                    }
                    analysis = msg.analysis == undefined ? '' : msg.analysis;
                    $(".question-content-r .exam-question").addClass("hidden");
                    $('.question-content .additional-bar').removeClass('hidden');
                    $('.question-content-r .analysis').removeClass('hidden')
                }else{
                    $(".question-content .exam-question").removeClass('hidden').html('è¯•é¢˜å·²è¢«åˆ é™¤');
                    // $(".question-content .answers").addClass("hidden");
                    $('.question-content .additional-bar').addClass('hidden');
                    $('.question-content-r .analysis').addClass('hidden')

                }

                createQuestionsDom(msg, combId, perScore, time);
                setQuestionsIndex(questionsId, index);

            } else {
                if(passMode == 1 && msg.errCount){
                    $('.exam-error-num span').text(parseInt(errorTimes)-msg.errCount)
                }
                createQuestionsDom(msg, combId, perScore, time);
                setQuestionsIndex(questionsId,index);
            }
        }

        //åˆ›å»ºè¯•é¢˜DOM
        function createQuestionsDom(data, comb_id, perScore, time){
            var questionId = data.test_id,
                questionType = data.type,
                questionsTitle = $("#numberCardModal a.questions_"+questionId).parents(".card-content").find(".card-content-title").text(),
                html = '';

            if (data.error) {
                html += '<label for="key1"> '+data.error+'</label>';
                $("#numberCardModal a.questions_"+questionId).parent(".box").removeClass("s1").addClass("s2")
                $('.additional-bar').hide()
            }else{
                $('.additional-bar').show()
            }

            //è§£æžåˆå§‹åŒ–
            $(".analysis .question-ans-right").html("");
            $(".analysis .question-analysis").html("");

            //åŠ è½½å¤§é¢˜æ ‡é¢˜
            $(".questions-title").html(questionsTitle);

            //åŠ è½½é¢˜å¹²
            if(data.parent_info==undefined){
                //æ­£å¸¸é¢˜åž‹
                current_comb_id = '';
                $(".question-content-l .exam-question").html(data.question);
                $(".question-content-r .exam-question").addClass('hidden');
                $(".questions-content").attr("perScore",perScore);
            }else {
                //ç»„åˆé¢˜
                //ç»„åˆé¢˜é¢˜å¹²åŠ è½½åŽï¼ŒåŒä¸€é¢˜å†…åˆ‡æ¢ä¸é‡æ–°åŠ è½½é¢˜å¹²
                if(comb_id!=current_comb_id){
                    $(".question-content-l .exam-question").html(data.parent_info);
                }
                current_comb_id = comb_id;//æ›´æ–°å½“å‰ç»„åˆé¢˜id
                $(".question-content-r .exam-question").html(data.question);
                $(".questions-content").attr("perScore",perScore);
                $(".question-content-r .exam-question").removeClass("hidden");
            }

            var optionsDisorder = data.optionsDisorder;
            //éšæœºlist ,[1,2,3,4,5,6,7,8]éšæœºä¹±åº
            var shuffleList = data.shuffleArray;
            var shuffleIndex;
            //è¯•é¢˜label list
            var questionLabelList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H','I','J','K','L','M','N','O','P','Q','R','S','T'];
            var questionLabel;

            if(questionType=="1"){
                $(function () {
                    for(var ansi=1; ansi<21; ansi++){
                        if(optionsDisorder==1){
                            shuffleIndex = shuffleList[ansi-1];
                            questionLabel = '';
                        }else {
                            shuffleIndex = ansi;
                            questionLabel = questionLabelList[ansi-1]+'.';
                        }

                        if(data['answer'+shuffleIndex]!=undefined){
                            html +=
                                '<div class="select single-select">'+
                                '    <input type="radio" class="radioOrCheck hidden" data-type="'+data.type+'" id="'+questionId+shuffleIndex+'" name="keyChk_questions_'+questionId+'" data-name="key'+shuffleIndex+'">'+
                                '    <label for="'+questionId+shuffleIndex+'" >'+
                                '        <span class="select-icon"><i class="icon icon-m_exam_correct"></i></span>'+
                                '        <span class="words"><span class="words-option">'+ questionLabel + '</span>' +data["answer"+shuffleIndex]+'</span>'+
                                '    </label>'+
                                '</div>';
                        }
                    }
                });
            }
            if(questionType=="2"){

                $(function () {
                    for(var ansi=1; ansi<21; ansi++){
                        if(optionsDisorder==1){
                            shuffleIndex = shuffleList[ansi-1];
                            questionLabel = '';
                        }else {
                            shuffleIndex = ansi;
                            questionLabel = questionLabelList[ansi-1]+'.';
                        }

                        if(data['answer'+shuffleIndex]!=undefined){
                            html +=
                                '<div class="select multi-select">'+
                                '    <input type="checkbox" class="radioOrCheck hidden" data-type="'+data.type+'" id="'+questionId+shuffleIndex+'" name="keyChk_questions_'+questionId+'" data-name="key'+shuffleIndex+'">'+
                                '    <label for="'+questionId+shuffleIndex+'" >'+
                                '        <span class="select-icon"><i class="icon icon-m_exam_correct2"></i></span>'+
                                '        <span class="words"><span class="words-option">'+ questionLabel + '</span>' +data["answer"+shuffleIndex]+'</span>'+
                                '    </label>'+
                                '</div>';
                        }
                    }
                });
            }
            if(questionType=="3"){
                html +=
                    '<div class="select judge rt">'+
                    '    <input type="radio" class="radioOrCheck hidden" data-type="'+data.type+'"  id="'+questionId+'1" name="keyJudge_questions_'+questionId+'" data-name="key1" value="1"/>'+
                    '    <label for="'+questionId+'1">'+
                    '        <span class="select-icon"><i class="icon icon-m_exam_correct"></i></span>'+
                    '        <span class="words">æ­£ç¡®</span>'+
                    '    </label>'+
                    '</div>';
                html +=
                    '<div class="select judge wg">'+
                    '    <input type="radio" class="radioOrCheck hidden" data-type="'+data.type+'"  id="'+questionId+'2" name="keyJudge_questions_'+questionId+'" data-name="key2" value="0"/>'+
                    '    <label for="'+questionId+'2">'+
                    '        <span class="select-icon"><i class="icon icon-m_exam_error"></i></span>'+
                    '        <span class="words">é”™è¯¯</span>'+
                    '    </label>'+
                    '</div>';
            }
            if(questionType=="4"){
                for(var i=0;i<20;i++){
                    html+=addBlankQuestionItem(data,i+1);
                }
            }
            if(questionType=="5"){
                var fileHtml = '';
                var fileUrl = '';
                if(data.upload_file!=undefined){
                    for(var j=0;j<data.upload_file.length; j++){
                        fileUrl = aliyunEncodeURI(data.upload_file[j].url);
                        fileHtml += '<div class="file-row">'+
                            '<a class="file ellipsis" href="'+fileUrl+'">'+data.upload_file[j].filename+'</a>'+
                            '<i class="icon icon-m_exam_error2 icon-file-delete"></i>'+
                            '</div>';
                    }
                }
                html += '<div class="filled">' +
                        '<div class="keyCloze" style="height: 250px" data-type="'+data.type+'" id="keyCloze_'+questionId+'">'+data.test_ans+'</div>' +
                        '<input type="hidden" name="key1" value="" />' +
                        '<input type="file" name="uploadFile" class="hidden wang-upload-file" /><div class="file-list">' + fileHtml +
                        '</div></div>';

            }
            if(questionType=="7"){
                var audioHtml = '';
                for (var k=0; k< data.attachment.length; k++)
                    audioHtml += '<div class="audio-row">' +
                                '     <audio src="'+data.attachment[k]+'" controls></audio>' +
                                '      <i class="icon icon-m_exam_error2 icon-audio-delete"></i>' +
                                '</div>';
                html +=
                    '<div class="record">' +
                    '   <div class="recorder">' +
                    '       <button class="btn btn-default start-recording">' +
                    '           å½•éŸ³<img src="https://cdnoss.kaoshixing.com/static/plugins/FlashWavRecorder/images/icon_record_record.png" alt="å½•éŸ³">' +
                    '       </button>' +
                    '       <button class="btn btn-default level">' +
                    '           éŸ³é‡<div class="progress"></div>' +
                    '       </button>' +
                    '       <button class="btn btn-default stop-recording">' +
                    '           åœæ­¢<img src="https://cdnoss.kaoshixing.com/static/plugins/FlashWavRecorder/images/icon_record_stop.png" alt="åœæ­¢å½•éŸ³"/>' +
                    '       </button>' +
                    '       <button class="btn btn-default upload">' +
                    '           <div class="flash-content" id="flash'+questionId+'" data-id="'+questionId+'"' +
                    '               <p>è¯·ç¡®ä¿æ‚¨çš„æµè§ˆå™¨å·²å®‰è£…Adobe Flash Playerã€‚</p>' +
                    '           </div>' +
                    '       </button>' +
                    '       <button class="btn btn-default uploading">ä¸Šä¼ ä¸­...</button>' +
                    '   </div>' +
                    '   <div class="audio-list">'+audioHtml+'</div>' +
                    '   <form id="uploadForm_'+questionId+'" name="uploadForm_'+questionId+'" action="/exam/attachment_operate/?method=upload&platform=pc">' +
                    '       <input name="questionId" value="'+questionId+'" type="hidden" />' +
                    '       <input name="examResultsId" type="hidden" />' +
                    '       <input name="examInfoId" type="hidden" />' +
                    '       <input name="format" value="json" type="hidden" />' +
                    '   </form>' +
                    '</div>';
            }

            $(".question-content .answers").html(html);

            if(questionType=='5'){
                //åˆå§‹åŒ–ç¼–è¾‘å™¨
                wangEditorInit();
            }

            if(questionType=='7'){
                //åˆå§‹åŒ–å½•éŸ³é¢˜ç»„ä»¶
                recorderInit();
            }

            //åˆ¤æ–­æ˜¯å¦æ ‡è®°æœ¬é¢˜
            $("#numberCardModal .iconBox").each(function(index, element) {
                if($(this).attr("questionsId") == questionId){
                    var _markDom = $("#markQuestion");
                    if($(this).parent().hasClass("marked")){
                        // æ ‡è®°è¯•é¢˜
                        _markDom.removeClass("icon-mark").addClass("icon-marked");
                        _markDom.find(".icon").removeClass("icon-p_exam_tag_de").addClass("icon-p_exam_tag_se");
                        _markDom.find(".icon-label").text("å–æ¶ˆæ ‡è®°");
                    }else {
                        //å–æ¶ˆæ ‡è®°
                        _markDom.removeClass("icon-marked").addClass("icon-mark");
                        _markDom.find(".icon").removeClass("icon-p_exam_tag_se").addClass("icon-p_exam_tag_de");
                        _markDom.find(".icon-label").text("æ ‡è®°æœ¬é¢˜");
                    }
                    return false;
                }
            });

            //åˆ¤æ–­æ˜¯å¦ç­”è¿‡ï¼Œæ ‡è®°ç­”æ¡ˆ
            var list = "";

            if(data.test_ans!=""&&data.type!="4"&&data.type!="5"&&data.type!="7"){
                if(data.test_ans){
                    list = data.test_ans.split(",");
                    var checkInput = $(".question-content").find("input.radioOrCheck");
                    checkInput.each(function(index, element) {
                        var obj = $(this);
                        var name = obj.attr("data-name");
                        $.each(list, function(index, value) {
                            if(value == name){
                                obj.prop("checked",true);
                            }
                        });
                    });
                }
            }

            //åˆ¤æ–­æ˜¯å¦æŸ¥çœ‹è¿‡è§£æžï¼Œæ·»åŠ ç›¸åº”æ ·å¼
            if (practice_mode=='1') {
                if(data.checked_analysis == "1"){
                    check_analysis();
                    show_analysis();
                }
            }
            //æ¯é¢˜é™åˆ¶ç­”é¢˜æ—¶é•¿ é—¯å…³æ¨¡å¼
            if(perTimeRestrict == "-1") {
                //è¿›è¡Œå€’è®¡æ—¶
                perTimeDown(time);
                $("#nextQuestions").removeClass("disabled");
            }
        }

        //èŽ·å–å•ç±»è¯•é¢˜æ€»æ•°åŠå½“å‰è¯•é¢˜æŽ’ä½
        function setQuestionsIndex(questionsId,index){
            var test_count = $("#numberCardModal .iconBox").length;
            //åˆ¤æ–­æ˜¯å¦ç¬¬ä¸€é¢˜æˆ–æœ€åŽä¸€é¢˜ï¼Œå› æ­¤ä¸Šä¸€é¢˜ä¸‹ä¸€é¢˜æŒ‰é’®ï¼Œ0ä¸ºç¬¬ä¸€é¢˜ï¼Œ1ä¸ºæœ€åŽä¸€é¢˜
            if(test_count<=1){
                $("#preQuestions").addClass("disabled");
                $("#nextQuestions").addClass("disabled");
            }else{
                if(index===0){
                    $("#preQuestions").addClass("disabled");
                    $("#nextQuestions").removeClass("disabled");
                }else if(index===1){
                    $("#preQuestions").removeClass("disabled");
                    $("#nextQuestions").addClass("disabled");
                }else{
                    $("#preQuestions").removeClass("disabled");
                    $("#nextQuestions").removeClass("disabled");
                }
            }

            $(".question-content").attr("data-id", questionsId);
            $("#preQuestions").attr("nowId", questionsId);
            $("#nextQuestions").attr("nowId", questionsId);
            $("#checkAnalysis").attr("nowId", questionsId);
            $("#numberCardModal .iconBox").each(function(index, element) {
                if($(this).attr("questionsId")==questionsId){
                    var num = $(this).text();
                    if($(this).parent().hasClass("insert-box")){
                        $("#questionsNum").text(num);
                    }else {
                        $("#questionsNum").text(num+".");
                    }
                    return false;
                }
            });
        }

        //åˆå§‹åŒ–ç¼–è¾‘å™¨
        function wangEditorInit() {
            var keyCloze  = $('.question-content').find('.keyCloze');
            if (keyCloze.length != 0) {
                var editor = new wangEditor($('.question-content').find('.keyCloze'));
                editor.config.uploadImgUrl = '/baseinfo/admin/upload/?userRole=staff&action=uploadimage';
                editor.config.uploadImgFileName = 'upfile';
                editor.config.noPaste = true;
                editor.config.menus = [
                    'table',
                    '|',
                    'img',
                    'upload',
                    '|',
                    'fullscreen'
                ];
                editor.create();
                editor.$txt.blur(function () {
                    var txt = $.trim(editor.$txt.html());
                    if (txt != '<p><br></p>') {
                        var questionId = $(".question-content").attr("data-id");
                        var keyList = editor.$txt.html();
                        $(keyCloze).parents('.wangEditor-container').next().val(keyList);
                        saveAnswerFn(questionId, editor.$txt.html());
                    }
                });
            }
        }

        //åˆå§‹åŒ–å½•éŸ³ç»„ä»¶
        function recorderInit() {
            var appWidth = 24;
            var appHeight = 24;
            var flashvars = {'upload_image': '/static/plugins/FlashWavRecorder/images/icon_record_upload.png'};
            var params = {};
            $(".recorder .flash-content").each(function(index, element) {
                var RECORDER_APP_ID = "flash"+$(this).attr("data-id");
                var attributes = {'id': RECORDER_APP_ID, 'name': RECORDER_APP_ID};
                swfobject.embedSWF("/static/plugins/FlashWavRecorder/recorder.swf?v=201801171822", RECORDER_APP_ID, appWidth, appHeight, "11.0.0", "", flashvars, params, attributes);
            });
        }

        // åˆå§‹åŒ–æ“ä½œæŒ‰é’®
        function operationInitial() {
            $(".analysis").addClass("hidden");
            $("#markQuestion").removeClass("icon-marked").addClass("icon-mark");
            $("#markQuestion .icon").removeClass("icon-p_exam_tag_se").addClass("icon-p_exam_tag_de");
            $("#markQuestion").find(".icon-label").text("æ ‡è®°æœ¬é¢˜");
        }

    });

    //å•é€‰å¤šé€‰åˆ¤æ–­ç­”æ¡ˆå­˜å‚¨å‡½æ•°
    function type123save(checked_analysis) {
        var questionsType = $(".radioOrCheck").attr("data-type");
        var parentDiv = $(".radioOrCheck").parents(".question-content");
        var questionsId = parentDiv.attr("data-id");
        var keyList = "";
        checked_analysis = checked_analysis || 0;
        if(questionsType=="1"){ //å•é€‰
            $(parentDiv.find(".radioOrCheck")).each(function(index, element) {
                if($(this).is(":checked")){
                    keyList = $(this).attr("data-name")+",";
                    return;
                }
            });
            saveAnswerFn(questionsId , keyList, checked_analysis);
        }else if(questionsType=="2"){ //å¤šé€‰
            $(parentDiv.find(".radioOrCheck")).each(function(index, element) {
                if($(this).is(":checked")){
                    keyList += $(this).attr("data-name")+",";
                }
            });
            //å¤šé€‰ä¿å­˜ç­”æ¡ˆå»¶è¿Ÿè°ƒç”¨
            answered_multi = {"questionsId":questionsId,"keyList":keyList};
            saveAnswerFn(answered_multi.questionsId , answered_multi.keyList, checked_analysis);
        }else if(questionsType=="3"){ //åˆ¤æ–­
            $(parentDiv.find(".radioOrCheck")).each(function(index, element) {
                if($(this).is(":checked")){
                    keyList = $(this).attr("data-name")+",";
                }
            });
            saveAnswerFn(questionsId , keyList, checked_analysis);
        }
    }

    //å¡«ç©ºç­”æ¡ˆå­˜å‚¨
    function type4save(checked_analysis) {
        var parentDiv = $(".keyFill").parents(".question-content");
        var questionsId = parentDiv.attr("data-id");
        var keyFillDom = parentDiv.find(".keyFill");
        var keyList = "";
        checked_analysis = checked_analysis || 0;
        keyFillDom.each(function(index, element) {
            if(index+1!=keyFillDom.length){
                keyList += $(this).val()+"||";
            }else{
                keyList += $(this).val();
            }
        });
        saveAnswerFn(questionsId , keyList, checked_analysis);
    }

    // æŸ¥çœ‹è§£æžåŽæ ·å¼æ·»åŠ 
    function check_analysis(){
        $(".radioOrCheck").prop("disabled",true);
        $(".answers textarea").prop("disabled",true);
    }

    // æ˜¾ç¤ºç­”æ¡ˆè§£æž
    function show_analysis() {
        $(".analysis .question-ans-right").html(test_ans_right);
        if(analysis==""||analysis==undefined){
            $(".analysis .question-analysis").html("æ— ");
        }else {
            $(".analysis .question-analysis").html(analysis);
        }
        $(".question-content .analysis").removeClass("hidden");
    }

    //**************************************èŽ·å–è¯•é¢˜**************************************

    //**************************************ç­”æ¡ˆå­˜å‚¨**************************************
    var answered_num = 1; //å·²ç­”æœªä¿å­˜è€ƒé¢˜æ•°é‡
    var answered_multi_all = []; //æ‰€ä»¥è¯•é¢˜å»¶æ—¶æäº¤æ•°æ®
    var answered_all = [];

    //åˆå§‹åŒ–ç­”é¢˜è¿›åº¦
    commitProcess();

    //é—®ç­”é¢˜ä¸Šä¼ é™„ä»¶
    $("body").on("change", ".question-content .wang-upload-file", function () {
        var _this = $(this);

        if($(_this).value == ''){
            return false;
        }

        var question_index=$(_this).parents(".question-content").find(".question-index").text().replace('.',"");
        var question_id = $(_this).parents(".question-content").attr("data-id");
        var uploadUrl = '/exam/attachment_operate/?method=upload&platform=pc&uploadType=uploadFile';
        var formHtml = '<form id="fileupForm" class="hidden" action="'+uploadUrl+'" method="post" enctype="multipart/form-data" target="fileupIframe"></form>';
        var iframeHtml = '<iframe name="fileupIframe" id="fileupIframe" class="append"></iframe>';
        var inputHmtl = '<input type="text" class="append" name="questionId" value="'+question_id+'">'+
            '<input type="text" class="append" name="examInfoId" value="'+exam_info_id+'">'+
            '<input type="text" class="append" name="questionIndex" value="'+question_index+'">'+
            '<input type="text" class="append" name="userId" value="'+examUserId+'">'+
            '<input type="text" class="append" name="examResultsId" value="'+exam_results_id+'">';

        $(_this).wrap(formHtml);
        $('#fileupForm').append(iframeHtml+inputHmtl);
        $('#fileupForm').submit();


        //ä¸Šä¼ å›žè°ƒ
        $("#fileupIframe").load(function () {
            var msg = $(this).contents().find('body').text();
            var _parent = $(this).parents(".question-content");
            var questionId = $(_parent).attr("data-id");

            if(msg!=''){
                $('#fileupForm')[0].reset();
                $('#fileupForm .append').remove();
                $('#fileupForm .wang-upload-file').unwrap();

                msg = JSON.parse(msg);
                if (msg.success) {
                    var file_row = '<div class="file-row">'+
                        '<a class="file ellipsis" href="'+aliyunEncodeURI(msg.bizContent.audioUrl)+'">'+msg.bizContent.filename+'</a>'+
                        '<i class="icon icon-m_exam_error2 icon-file-delete"></i>'+
                        '</div>';
                    $(_parent).find('.file-list').append(file_row);
                    commitProcess(questionId, true);
                    showSuccessTip('é™„ä»¶ä¸Šä¼ æˆåŠŸ');
                    //åŒæ­¥æ·»åŠ ç›®æ ‡è¯•é¢˜ç¼“å­˜ä¸­çš„æ–‡ä»¶
                    temporaryData = JSON.parse(window.localStorage.getItem("questionNumber"));
                    if(temporaryData[questionId]) {
                        var datas = {};
                        datas.filename = msg.bizContent.filename;
                        datas.url = msg.bizContent.audioUrl;
                        temporaryData[questionId].upload_file.push(datas);
                        window.localStorage.setItem("questionNumber", JSON.stringify(temporaryData));
                    }
                } else if(msg.code == 33000) {
                    showErrorTip("æ–‡ä»¶å¤§å°è¶…é™");
                } else{
                    showErrorTip('ä¸Šä¼ å¤±è´¥ï¼Œè¯·é‡è¯•');
                }
            }
        });

    });

    //é—®ç­”é¢˜ä¸Šä¼ é™„ä»¶åˆ é™¤
    $("body").on("click", ".file-list .icon-file-delete", function () {
        var _this = $(this);
        var _row = $(_this).parent(".file-row");
        var _parent = $(_this).parents(".question-content");
        var fileUrl = $(_row).find(".file").attr("href");
        var filename = $(_row).find(".file").text();
        var questionId = $(_parent).attr("data-id");
        var upload_file=[];
        _parent.find('.file-row').each(function(){
            var file;
            var url=$(this).find(".file").attr("href");
            var name=$(this).find(".file").text();
            if(fileUrl!=url) { //éåŽ†ï¼Œå–å‡ºæœªè¦åˆ é™¤çš„æ–‡ä»¶åˆ—è¡¨ï¼Œä¼ ç»™åŽç«¯
                file = {
                    "filename": name,
                    "url": decodeURIComponent(url)
                };
                upload_file.push(file);
            }
        })
        var timeStamp = new Date().getTime();
        var dataJson = {
            exam_results_id: exam_results_id,
            test_id: questionId,
            upload_file:JSON.stringify(upload_file),
            exam_info_id: exam_info_id,
            time_stamp: timeStamp
        };
        $.ajax({
            url: '/exam/alter_paper_records_file',
            type: 'post',
            data: dataJson,
            dataType: 'json',
            success: function (msg) {
                if (msg){
                    $(_row).remove();
                    //åŒæ­¥æ¸…é™¤ç›®æ ‡è¯•é¢˜ç¼“å­˜ä¸­çš„æ–‡ä»¶
                    temporaryData = JSON.parse(window.localStorage.getItem("questionNumber"));
                    if(temporaryData[questionId]){
                        for(var i in temporaryData[questionId].upload_file) {
                            if(temporaryData[questionId].upload_file[i].filename == filename)temporaryData[questionId].upload_file.splice(i,1);
                        }
                        window.localStorage.setItem("questionNumber", JSON.stringify(temporaryData));
                    }
                }else{
                    showErrorTip('åˆ é™¤å¤±è´¥');
                }
            },
            error: function () {
                showErrorTip('æœåŠ¡å™¨å¼‚å¸¸ï¼Œç¨åŽå†è¯•');
            }
        })
    });

    //å½•éŸ³é¢˜å›žè°ƒ
    saveAudioStorge = function(id, url){
        temporaryData = JSON.parse(window.localStorage.getItem("questionNumber"));
        if(temporaryData[id]){
            temporaryData[id].attachment.push(url);
            window.localStorage.setItem("questionNumber", JSON.stringify(temporaryData));
        }
    }

    //åˆ é™¤å½•éŸ³
    $("body").on('click',".audio-list .icon-audio-delete",function(e) {
        e.preventDefault();

        var _this = $(this);
        var _question = $(_this).parents(".question-content");
        var question_id = $(_question).attr("data-id");
        var _audio = $(_this).parents(".audio-row");
        var audio_url = $(_audio).find("audio").attr("src");

        var upload_file=[];
        _question.find('.audio-row').each(function(){
            var url=$(this).find("audio").attr("src");
            if(audio_url!=url) { //éåŽ†ï¼Œå–å‡ºæœªè¦åˆ é™¤çš„æ–‡ä»¶åˆ—è¡¨ï¼Œä¼ ç»™åŽç«¯
                upload_file.push(decodeURIComponent(url));
            }
        })
        var timeStamp = new Date().getTime();
        var dataJson = {
            exam_results_id: exam_results_id,
            test_id: question_id,
            attachment:JSON.stringify(upload_file),
            exam_info_id: exam_info_id,
            time_stamp: timeStamp
        };
        $.ajax({
            type: "POST",
            url: "/exam/alter_paper_records_file",
            dataType:"json",
            data:dataJson,
            success:function(msg) {
                if(msg){
                    $(_audio).remove();
                    temporaryData = JSON.parse(window.localStorage.getItem("questionNumber"));
                    if(temporaryData[question_id]){
                        for(var i in temporaryData[question_id].attachment) {
                            if(temporaryData[question_id].attachment[i] == audio_url)temporaryData[question_id].attachment.splice(i,1);
                        }
                        window.localStorage.setItem("questionNumber", JSON.stringify(temporaryData));
                    }
                }else{
                    showErrorTip("åˆ é™¤å¤±è´¥");
                }
            }
        });
    });


    //å•é€‰ï¼Œå¤šé€‰ï¼Œåˆ¤æ–­
    //ä¹‹æ‰€ä»¥å°†äº‹ä»¶ç»‘å®šè‡³labelè€Œä¸æ˜¯.selectï¼Œæ˜¯å› ä¸ºselectå†…åŒæ—¶åŒ…å«inputå’Œlabelï¼Œ
    //è€ŒlabelåˆæŒ‡å‘inputï¼Œè¿™ä¼šå¯¼è‡´ç‚¹å‡»selectï¼Œclickè¢«è§¦å‘ä¸¤æ¬¡
    $("body").on("click", ".question-content .select label", function(e) {
        var _this = $(this);
        var _parent = $(_this).parents(".question-content");
        var _select = $(_this).parents(".select");
        var questionsId = _parent.attr("data-id");
        var questionsType = $(".radioOrCheck").attr("data-type");
        var keyList = "";
        var checked_analysis;

        setTimeout(function () {
            if($(_select).hasClass("single-select")||$(_select).hasClass("judge")){
                $(_parent).find(".radioOrCheck").each(function(index, element) {
                    if($(this).is(":checked")){
                        keyList = $(this).attr("data-name")+",";
                    }
                });

                //ç»ƒä¹ æ¨¡å¼ï¼Œå•é€‰å’Œåˆ¤æ–­ç­”é¢˜ç«‹å³æ˜¾ç¤ºè§£æž
                /*æ–°éœ€æ±‚-æ˜¾ç¤ºè§£æžæ–¹å¼æ”¹ä¸ºä¸Žå…¶ä»–é¢˜åž‹ä¸€æ ·ï¼Œæ³¨é‡Šæ­¤æ®µä»£ç */
                // if(practice_mode=='1'){
                //     check_analysis(questionsType);
                //     show_analysis();
                //     checked_analysis = 1;
                // }

            }else if($(_select).hasClass("multi-select")){
                $(_parent).find(".radioOrCheck").each(function(index, element) {
                    if($(this).is(":checked")){
                        keyList += $(this).attr("data-name")+",";
                    }
                });
            }

            saveAnswerFn(questionsId , keyList, checked_analysis);
        }, 100);

    });

    //å¡«ç©º
    $("body").on("blur", ".question-content .keyFill", function(e) {
        var _parent = $(this).parents(".question-content");
        var questionsId = _parent.attr("data-id");
        var keyList = [];

        $(_parent).find(".keyFill").each(function (index, element) {
            keyList[index] = $(this).val();
        });

        saveAnswerFn(questionsId , keyList.join("||"));
    });



    //todo è¢«åˆ é™¤çš„è¯•é¢˜å½“ä½œå·²ç­”ï¼Ÿï¼Ÿï¼Ÿ

    //äº¤å·
    $("#endExamBtn").click(function (e) {
        e.preventDefault();

        var length = $("#numberCardModal .modal-body .box.s1").length;
        var html = "";

        if(length==0){
            html = "æ˜¯å¦çŽ°åœ¨äº¤å·ï¼Ÿ";
        }else {
            if(passMode==1){
                html = "æ˜¯å¦çŽ°åœ¨äº¤å·ï¼Ÿ";
            }else{
                html = "æœ‰è¯•é¢˜æœªå®Œæˆï¼Œæ˜¯å¦çŽ°åœ¨äº¤å·ï¼Ÿ";
            }
        }

        $("#endExamModal .modal-title").html(html);
        $("#endExamModal").modal();
    });
    var loadingProgress = 0; //è¿›åº¦æ¡æ•°å€¼
    var loadingText = ''; //ä¸åŒç™¾åˆ†æ¯”æ˜¾ç¤ºå†…å®¹
    var progress; //è¿›åº¦æ¡å®šæ—¶å™¨

    //ç¡®è®¤äº¤å·
    $("#confirmEndExamBtn").click(function (e) {
        e.preventDefault();

        //åˆ¤æ–­æ˜¯å¦è¾¾åˆ°æœ€çŸ­ç­”é¢˜æ—¶é•¿
        if(!isMinTimeLimit(setMinExamTime,minExamTime,true)){//è‹¥æœªè¾¾åˆ°æœ€çŸ­ç­”é¢˜æ—¶é•¿ã€éžå¼ºåˆ¶äº¤å·
            $("#endExamModal").modal('hide');
            return false;
        }
        
        //ç›‘å¬é¡µé¢åˆ‡æ¢
        var hiddenTime;
        var statTime = 0;
        var hiddenNum = 0;
        var makeSureTime  = setInterval(function () {
            statTime++
        },1000);
        
        $('#endExamModal').addClass('hidden');
        $("#spinnerLoading").addClass('hide');
        $('.loading-box').removeClass('hidden');

        saveExamFn(0);
        
        //é¡µé¢ä¸å¯è§çš„æƒ…å†µ
        document.addEventListener("visibilitychange", function() {

            if(document.visibilityState === 'hidden'){
                clearInterval(makeSureTime);
                hiddenTime = setInterval(function(){

                    hiddenNum++;

                    if((hiddenNum+statTime) >= 10){
                        clearInterval(hiddenTime);
                        //window.location.href = "/exam/result/inquire?examResultsId="+exam_results_id;
                    }
                },1000)

            }else if(document.visibilityState === 'visible'){

                clearInterval(hiddenTime) ;

                var totalTime = hiddenNum+statTime;

                if(loadingProgress < totalTime*10){

                    loadingProgress = totalTime*10

                }
            }

        });
        
    });



    //ç­”é¢˜åŽæäº¤åŽå°å¼‚æ­¥ä¿å­˜fn
    function saveAnswerFn(questionsId,keyList,checked_analysis){
        if(perTimeRestrict == "-1" || examTimeRestrict != "-1") {
            clearInterval(getExamEndTimeInterval);
        }
        //keyList = keyList.replace(/"/g,"&quot;").replace(/'/g,"&apos;");
        checked_analysis = checked_analysis || 0;
        //æ—¶é—´æˆ³
        var timeStamp = new Date();
        var dataForm = {
            "examResultsId": exam_results_id,
            "testId": questionsId,
            "testAns": keyList,
            "checkedAnalysis": checked_analysis,
            "examInfoId": exam_info_id,
            "timeStamp": timeStamp.getTime()
        };

        $("#spinnerLoading").addClass("hide");

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/exam/exam_start_ing",
            data: dataForm,
            success: function(msg){
                $("#spinnerLoading").removeClass("hide");

                if(msg.success == "answered") {
                    saveExamFn(6);
                    return;
                }

                if(msg.success=='true'){

                    temporaryData = JSON.parse(window.localStorage.getItem("questionNumber"));
                    for(var i in msg.testMap) {
                        if(msg.testMap[i])temporaryData[questionsId][i] = msg.testMap[i];
                    }
                    window.localStorage.setItem("questionNumber", JSON.stringify(temporaryData));


                    if(dataForm.testAns==''){
                        commitProcess(questionsId, false);
                    }else {
                        commitProcess(questionsId, true);
                    }

                    if(perTimeRestrict == "-1" || examTimeRestrict != "-1") {
                        if(msg.endTimeMap.code=='3'){
                            $('.submit-notice').show();
                            var endNum = 3;
                            var submitExam = setInterval(function(){
                                endNum--;
                                if(endNum < 0){
                                    clearInterval(submitExam);
                                    $('.submit-notice').hide();
                                    saveExamFn(6);//ç«‹å³äº¤å·
                                }
                                $('.notice-time').text(endNum)
                            },1000);
                        }
                        if(msg.endTimeMap.code=='1'){
                            if(answer_time_left!=msg.endTimeMap.totalTime){
                                d = new Date();
                                initTime = parseInt(d.getTime()/1000);
                                answer_time_left = msg.endTimeMap.totalTime;
                                endTime = initTime + answer_time_left;
                                $("#timeResetModal .delay-time").text(msg.endTimeMap.delayTimeStamp);
                                $('#timeResetModal').modal();
                            }
                        }else if(msg.endTimeMap.code=='2'){
                            saveExamFn(0);
                        }
                    }

                }else{
                    alert("æ“ä½œå¤±è´¥ï¼Œè¯·è”ç³»ç®¡ç†å‘˜ï¼");
                }
            },
            error: function () {
                $("#spinnerLoading").removeClass("hide");
            }
        });
    }

    //æŸ¥è¯¢æˆç»©æ—¶é—´é—´éš”
    var queryInterval;
    var resultTime = 2; //è¯·æ±‚è€ƒè¯•ç»“æžœçš„é—´éš”æ—¶é—´
    var examTimeOut = 0; //äº¤å·è¶…æ—¶è®¡æ—¶ä¾èµ–å€¼
    var examTimeOutClock; // äº¤å·è¶…æ—¶è®¡æ—¶å™¨

    window.saveExamFn=saveExamFn;
    //äº¤å·æäº¤åŽå°å¼‚æ­¥ä¿å­˜fn
    // isForce--æ˜¯å¦å¼ºåˆ¶äº¤å·ï¼Œå¼ºåˆ¶äº¤å·æ–¹å¼ //0--å¦ 1--æ˜¯ 2--åˆ‡å±é˜²ä½œå¼Š 3--xç§’ä¸åŠ¨è‡ªåŠ¨äº¤å· 4--é—¯å…³å¤±è´¥ 5--ç­”é¢˜æ—¶é—´æˆ–è€…è€ƒè¯•æ—¶é—´å·²åˆ°
    function saveExamFn(isForce){
        var switchScreen = 0;//åˆ‡å±æ¬¡æ•°
        var noOpsAutoCommit = 0;//æ— æ“ä½œæ—¶é—´
        switch(isForce) {
            case 2:
                switchScreen = parseInt(blur_count) + 1;
                break;
            case 3:
                noOpsAutoCommit = quietSecond+100000;
                break;
            default:
                break;
        }
        $(".had-save-mark").addClass("had-confirm-save");//ä½œä¸ºæ˜¯å¦å·²ç»è§¦å‘äº¤å·æ“ä½œçš„æ ‡è®°
        // $("#spinnerLoading").removeClass("hidden").removeClass("hide");
        $("#spinnerLoading").addClass("hidden")
        $('.loading-box').removeClass('hidden');
        //æ¸…é™¤è€ƒè¯•æ—¶é—´
        // éž"ä¸é™æ—¶é•¿"ç±»çš„è€ƒè¯•ï¼ŒèŽ·å–å€’è®¡æ—¶
        if(perTimeRestrict != "1" && examTimeRestrict != "-1") {
            clearInterval(timeDownInterval);
        }else if(perTimeRestrict == "-1"){
            clearTimeout(perTimer);
        }

        // è‹¥å¼€å¯æ‹ç…§é˜²ä½œå¼ŠåŠŸèƒ½ï¼Œåˆ™åœ¨äº¤å·ä¹‹å‰å†æ‹ä¸€æ¬¡ï¼Œç¡®ä¿è‡³å°‘æœ‰ä¸€å¼ 
        if(capture==-1){
            var questionId=$("#numberCardModal .modal-body .iconBox:last").attr("questionsId");
            $("#captureForm input[name=questionId]").val(questionId);
            webcam.capture(0);
        }

        setTimeout(
            function(){
                //è¿›åº¦æ¡å®šæ—¶å™¨
                progress = setInterval(function(){

                    var random =Math.floor(Math.random()*3+1);

                    loadingProgress+=random;

                    if(loadingProgress >= 100){

                        loadingProgress = 100;

                    }

                    if(loadingProgress <= 30 ){

                        loadingText = 'æ­£åœ¨æäº¤ç­”æ¡ˆ...';

                    }else if(loadingProgress >30 && loadingProgress <=70){

                        loadingText = 'æ­£åœ¨åˆ¤åˆ†ä¸­...'

                    }else{
                        loadingText = 'æ­£åœ¨å‡ºåˆ†ä¸­...';
                    }

                    $('.loading-label').text(loadingText);

                    $('.loading-num span').text(loadingProgress+'%').css({
                        marginLeft:loadingProgress+'%'
                    });

                    $('.loading-develop').width(loadingProgress+'%');

                },200);
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: "/exam/exam_ending",
                    data: "examInfoId="+exam_info_id+"&examResultsId="+exam_results_id+"&isForce="+isForce+"&switchScreen="+switchScreen+"&noOpsAutoCommit="+noOpsAutoCommit,
                    success: function (msg) {
                        if(msg.success){
                            //æ¸…é™¤è¯·æ±‚è€ƒè¯•æ—¶é—´çš„å®šæ—¶å™¨
                            clearInterval(getExamEndTimeInterval);
                            examTimeOutClock = setInterval(function(){
                                examTimeOut = examTimeOut + 1;
                                if(examTimeOut>20) {
                                    clearTimeout(queryInterval);
                                    return window.location.href = "/exam/exam_center_score?examResultsId="+exam_results_id+"&userId="+examUserId+"&companyId="+companyId;
                                }
                            },1000)
                            resultTimeout();
                        }else {
                            alert("æ“ä½œå¤±è´¥ï¼Œè¯·é‡è¯•ï¼");
                            $("#resultInquireModal").modal('hide');
                        }
                    },
                    error: function () {
                        alert("æ“ä½œå¤±è´¥ï¼Œè¯·é‡è¯•ï¼");
                        $("#resultInquireModal").modal('hide');
                    }
                });
            },1000);
    }

    // å€’è®¡æ—¶ // time ä¸ºè¯·æ±‚çš„æ—¶é•¿
    function resultTimeout() {
        clearTimeout(queryInterval);
        // è¯·æ±‚è€ƒè¯•ç»“æžœä»¥2-3-4-5-6-7-8-9-10-10-10çš„æ—¶é—´é—´éš”è¯·æ±‚
        queryInterval = setTimeout(resultInquire, (resultTime>11?resultTime:resultTime++)*1000);
    }

    //ç”Ÿæˆè€ƒè¯•æˆç»©
    function resultInquire() {
        //ä¸æ˜¾ç¤ºloading
        $("#spinnerLoading").addClass("hide");
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/exam/result/inquire",
            data: "examResultsId="+exam_results_id+"&userId="+examUserId+"&companyId="+companyId,
            ansyc: false,
            success: function (msg) {
                if(msg.success){
                    clearTimeout(queryInterval);

                    // æ¯200æ¯«ç§’æ£€æµ‹loadingProgressçš„å€¼ï¼Œå¦‚æžœåˆ°è¾¾100ï¼Œæ¸…é™¤å®šæ—¶
                    var time = setInterval(function(){
                        if(loadingProgress >= 100){
                            clearInterval(progress);
                            clearInterval(time);
                            clearInterval(examTimeOutClock);
                            window.location.href = "/exam/result/inquire?examResultsId="+exam_results_id;
                        }
                    },200);
                }else {
                    resultTimeout();
                }
            },
            error: function () {
                resultTimeout();
            }
        });
    }


    //**************************************ç­”æ¡ˆå­˜å‚¨**************************************


    //å­—å·
    $(function () {
        //é¢˜å¹²å­—å·é»˜è®¤16
        //å†…å®¹é»˜è®¤14ï¼ˆå•é€‰ï¼Œå¤šé€‰ï¼Œåˆ¤æ–­ï¼‰
        var questionSize = 16;
        var answerSize = 14;

        //å¢žåŠ å­—å·
        $(".fontsize-plus").click(function (e) {
            e.preventDefault();

            if(questionSize<20){
                questionSize = questionSize +1;
                answerSize = answerSize + 1;
                $(".exam-question").css({
                    "font-size": questionSize+"px"
                });
                $(".answers .select").css({
                    "font-size": answerSize+"px"
                });
            }
        });

        //å‡å°å­—å·
        $(".fontsize-minus").click(function (e) {
            e.preventDefault();

            if(questionSize>14){
                questionSize = questionSize - 1;
                answerSize = answerSize - 1;

                $(".exam-question").css({
                    "font-size": questionSize+"px"
                });
                $(".answers .select").css({
                    "font-size": answerSize+"px"
                });
            }

        });

    });



    //åˆ‡æ¢ä¸­è‹±æ–‡
    $("#switchLangBtn").click(function (e) {
        switchLang('en');
    });

    //æ˜¾ç¤ºç­”é¢˜å¡
    $("#numberCardBtn").click(function (e) {
        e.stopPropagation();
        e.preventDefault();

        $("#numberCardModal").modal();
    });

    //æ ‡è®°/å–æ¶ˆæ ‡è®°è¯•é¢˜
    $("body").on("click", "#markQuestion", function () {
        var questionId = $(this).parents(".question-content").attr("data-id");
        var _this = $(this);

        if($(_this).hasClass("icon-mark")){
            // æ ‡è®°è¯•é¢˜
            $(_this).removeClass("icon-mark").addClass("icon-marked");
            $(_this).find(".icon").removeClass("icon-p_exam_tag_de").addClass("icon-p_exam_tag_se");
            $(_this).find(".icon-label").text("å–æ¶ˆæ ‡è®°");
            $("#numberCardModal a.questions_"+questionId).parent(".box").addClass("marked");
            $("#numberCardModal a.questions_"+questionId).parent(".box").find(".question_marked").show();
        }else {
            //å–æ¶ˆæ ‡è®°
            $(_this).removeClass("icon-marked").addClass("icon-mark");
            $(_this).find(".icon").removeClass("icon-p_exam_tag_se").addClass("icon-p_exam_tag_de");
            $(_this).find(".icon-label").text("æ ‡è®°æœ¬é¢˜");
            $("#numberCardModal a.questions_"+questionId).parent(".box").removeClass("marked");
            $("#numberCardModal a.questions_"+questionId).parent(".box").find(".question_marked").hide();
        }

    });

    //**************************************é˜²ä½œå¼Š**************************************
    //ç¦æ­¢å¤åˆ¶ç²˜è´´
    document.oncontextmenu=new Function("event.returnValue=false");
    document.oncopy=new Function("event.returnValue=false");
    document.onpaste=new Function("event.returnValue=false");

    //æ‹ç…§é˜²ä½œå¼Š
    $(function () {
        var webcam_json = {};
        var capture_id;

        // å¼€å¯æ‘„åƒå¤´ï¼Œæ‹ç…§é˜²ä½œå¼Š
		$("#webcamAlert").addClass("hidden");
        if(capture==-1){
            $("#webcam").webcam({
                width: 320,
                height: 240,
                mode: "callback",
                swffile: "https://s6.kaoshixing.com/static/plugins/webcam/jscam_canvas_only.swf",
                onLoad: function() {
                    //èŽ·å–é¢˜ç›®æ€»æ•°
                    var question_total=$("#numberCardModal .modal-body .box").length;
                    webcam_json = getRandom(1, question_total);//åˆ›å»ºjsonå­˜æ‹ç…§é¢˜å·å’Œç›¸åº”æ‹ç…§çŠ¶æ€
                },
                onTick: function(remain) {},
                onSave: saveImg(),
                onCapture: function() {
                    webcam.save();
                },
                debug: function(type,string) {
                    // console.log(type + ": " + string);
                    if(type=='notify'&&string=='Camera started'){
                        $("#webcamAlert").addClass("hidden");

                        var questionId=$("#numberCardModal .modal-body .iconBox:first").attr("questionsId");
                        $("#captureForm input[name=questionId]").val(questionId);
                        setTimeout(function () {
                            webcam.capture(0);
                        }, 3000);

                        setTimeout(function () {
                            $("#webCamBar, #webcam").addClass("folded");
                        }, 10000)
                    }
                }
            });

            //ç‚¹å‡»è¯•é¢˜æ‹ç…§
            $("body").on("click", ".question-content", function () {
                var questionId = $(this).attr("data-id");

                if(typeof(webcam_json[questionId])!='undefined' && webcam_json[questionId]==0) {
                    webcam_json[questionId] = 1;
                    $("#captureForm input[name=questionId]").val(questionId);
                    webcam.capture(0);
                }
            });
        }

        //æ˜¾ç¤ºæ‘„åƒå¤´
        $("#webCamBar").click(function(e) {
            $("#webCamBar, #webcam").removeClass("folded");
        });
        //éšè—æ‘„åƒå¤´
        $("#webCamFold").click(function(e) {
            $("#webCamBar, #webcam").addClass("folded");
        });

        //èŽ·å–éšæœºè¯•é¢˜
        function getRandom(min, max) {
            //èŽ·å–è¯•é¢˜æ•°ç›®ï¼ŒæŒ‰ç…§1/10çš„æ¯”ä¾‹ï¼Œè‡³å°‘ä¸€é¢˜
            var random_num = Math.ceil((max-min+1)/10);
            var random_arr = [];
            var random_json = {};
            var question_id;

            while (random_arr.length<random_num){
                var random_int = Math.floor(Math.random() * (max - min + 1)) + min - 1;

                if(random_arr.indexOf(random_int)==-1){
                    question_id = $("#numberCardModal .modal-body .iconBox").eq(random_int).attr("questionsId");
                    random_json[question_id]= 0;
                    random_arr.push(random_int);
                }
            }
            return random_json;
        }

        function saveImg(data) {
            var pos = 0, ctx = null, saveCB, image = [];
            var canvas = document.createElement("canvas");
            canvas.setAttribute('width', 320);
            canvas.setAttribute('height', 240);
            if (canvas.toDataURL) {
                ctx = canvas.getContext("2d");
                image = ctx.getImageData(0, 0, 320, 240);
                saveCB = function(data) {
                    var col = data.split(";");
                    var img = image;
                    for(var i = 0; i < 320; i++) {
                        var tmp = parseInt(col[i]);
                        img.data[pos + 0] = (tmp >> 16) & 0xff;
                        img.data[pos + 1] = (tmp >> 8) & 0xff;
                        img.data[pos + 2] = tmp & 0xff;
                        img.data[pos + 3] = 0xff;
                        pos+= 4;
                    }
                    if (pos >= 4 * 320 * 240) {
                        ctx.putImageData(img, 0, 0);
                        $("#captureForm").append("<textarea name='file'>"+canvas.toDataURL("image/png")+"</textarea>");
                        $("#captureForm").submit();
                        $("#captureForm textarea").remove();
                        pos = 0;
                    }
                };
            }
            return saveCB;
        }

    });


    //åˆ‡å±é˜²ä½œå¼Š
    //è‹¥å¹²æ¬¡åˆ‡æ¢åŽè‡ªåŠ¨äº¤å·
    $(function(){
        // åˆ‡å±è®¡æ—¶å™¨
        var screenLimitInterval;
        if(set_full_screen==-1) {
            checkSwitchScreenCookie();//æ£€æŸ¥cookieå…³äºŽåˆ‡å±çš„å‚¨å­˜çŠ¶æ€ï¼Œcookieè¿‡æœŸäº†è§†ä¸ºåˆ‡å±æœ‰æ•ˆï¼Œç”¨äºŽæ£€éªŒé€€å‡ºè€ƒè¯•ç­‰æƒ…å†µ
            setInterval("setSwitchScreenCookie()",1000); //å®šæ—¶è®¾ç½®cookieæœ‰æ•ˆ

            $('#alertModal').modal("show");
            //è‹¥å¼€å¯å…¨å±é˜²ä½œå¼Šï¼Œåˆ™ç‚¹å‡»é¡µé¢è§¦å‘å…¨å±
            //screenfull.js?v=201801101413:93
            // Failed to execute 'requestFullscreen' on 'Element':
            // API can only be initiated by a user gesture.
            //å¿…é¡»æ‰‹åŠ¨è§¦å‘
            $("body").on("click", function (e) {
                $('#alertModal').modal("hide");
                //æ‹ç…§é˜²ä½œå¼Šçš„åˆ·æ–°æŒ‰é’®ä¸ç»‘å®šè¯¥äº‹ä»¶
                if(!$(e.target).hasClass("webcam-refresh")) {
                    //å½“ä¸”ä»…å½“é¡µé¢å¤„äºŽéžå…¨å±çŠ¶æ€æ—¶å†æ¬¡è§¦å‘å…¨å±è¯·æ±‚ï¼Œå¦åˆ™ï¼Œæ¯æ¬¡ç‚¹å‡»é¡µé¢éƒ½ä¼šå›žåˆ°é¡µé¢é¡¶éƒ¨
                    if (!screenfull.isFullscreen && screenfull.enabled) {
                        screenfull.request();
                    }
                }
            });

            //çª—å£å¤±åŽ»ç„¦ç‚¹
            $(window).blur(function () {
                if (screenfull.isFullscreen) {
                    setTimeout(function () {
                        blurCount();
                    }, 50);
                }
            });

            // çª—å£èŽ·å¾—ç„¦ç‚¹
            $(window).focus(function () {
                if (screenfull.isFullscreen) {
                    setTimeout(function () {
                        clearInterval(screenLimitInterval);
                    }, 60);
                }
            });

            //é€€å‡ºå…¨å±è®°ä¸€æ¬¡åˆ‡å±
            if (screenfull.enabled) {
                document.addEventListener(screenfull.raw.fullscreenchange, function () {
                    if (!screenfull.isFullscreen) {
                        setTimeout(function () {
                            blurCount();
                        }, 50);
                    }else {
                        setTimeout(function () {
                            clearInterval(screenLimitInterval);
                        }, 60);
                    }
                });
            }
        }


        //åˆ‡æ¢
        function blurCount(){
            clearInterval(screenLimitInterval);


            //å¦‚æžœå·²ç»ç‚¹å‡»äº†äº¤å·ï¼Œå–æ¶ˆå€’è®¡æ—¶

            if($(".had-save-mark").hasClass("had-confirm-save")){
                if(typeof screenLimitInterval=="undefined"){
                    return false;
                }
                clearInterval(screenLimitInterval);
                return false;
            }

            //é¢„ç•™æ—¶é—´
            var maxTime = parseInt(switchScreenSecond);
            var d = new Date();
            //å‰©ä½™æ—¶é—´æˆªæ­¢æ—¶é—´
            var restTime = parseInt(d.getTime()/1000) + maxTime;

            screenLimitInterval=setInterval(function(){
                var d = new Date();
                var restTimeLeft = restTime - parseInt(d.getTime()/1000);

                //å½“ä¸”ä»…å½“æ—¶é—´è¶…å‡ºè®¾å®šæ‰è®¡å…¥æ¬¡æ•°
                if(restTimeLeft<= 0) {
                    cuttingScreenCount=0;
                    sendCuttingScreenCount(cuttingScreenCount);

                    if(cuttingScreenCount>parseInt(blur_count)){
                        saveExamFn(2);
                    }else{
                        $("#blurCount").text(cuttingScreenCount);
                        $("#blurCountModal").modal();
                    }
                    clearInterval(screenLimitInterval);
                }
            },1000);
        }

        //é€šè¿‡cookieæ£€æŸ¥åˆ‡å±
        function checkSwitchScreenCookie(){
            var status=getCookie('switch_screen_status'+exam_results_id)=='1'?true:false;
            if(!status && exitSwicthStatus!="new") {
                cuttingScreenCount=0;
                sendCuttingScreenCount(cuttingScreenCount);

                if (cuttingScreenCount > parseInt(blur_count)) {
                    setTimeout("saveExamFn(2)",3000); //éœ€è¦å»¶è¿Ÿ1sä»¥ä¸Šï¼Œç­‰å¾…timeDownå‡½æ•°æ‰§è¡Œäº†å†äº¤å·
                } else {
                    $("#blurCount").text(cuttingScreenCount);
                    $("#blurCountModal").modal();
                }
            }
        }

    });


    //æ— æ“ä½œé˜²ä½œå¼Š
    $(function () {
        //è‹¥å¹²ç§’æ— æ“ä½œæç¤ºï¼Œè‡ªåŠ¨äº¤å·
        if(setQuietCheat==-1){
            //é¢„ç•™10ç§’æç¤ºæ—¶é—´
            var maxTime = parseInt(quietSecond)+10000;
            //å‰©ä½™æ—¶é—´
            var restTime = maxTime;

            var timeLimitInterval=setInterval(function(){
                //å¦‚æžœå·²ç»ç‚¹å‡»äº†äº¤å·ï¼Œå–æ¶ˆå€’è®¡æ—¶
                if($(".had-save-mark").hasClass("had-confirm-save")){
                    clearInterval(timeLimitInterval);
                    return false;
                }
                if(restTime== 0) {
                    $("#timeLimitAlert").text("äº¤å·ä¸­...");
                    clearInterval(timeLimitInterval);
                    saveExamFn(3);
                }else if (restTime<=10) {
                    $("#limitTimeCount").text(restTime);
                    $("#timeLimitAlert").removeClass("hidden");
                }
                restTime--;
            },1000);

            $("body").on('keydown click mousemove scroll', function(e){
                $("#timeLimitAlert").addClass("hidden");
                // reset
                restTime = maxTime;
            });
        }
    })

    //**************************************é˜²ä½œå¼Š**************************************


    //æœ€çŸ­ç­”é¢˜æ—¶é•¿  è¿”å›žä¸€ä¸ªåˆ¤æ–­å€¼ï¼Œå¦‚æžœè¿”å›žå€¼ä¸ºtrueï¼Œåˆ™å…è®¸è°ƒç”¨commit_examäº¤å·ï¼Œå¦åˆ™åœ¨è°ƒç”¨å‰return falseç»ˆæ­¢è°ƒç”¨commit_exam
    function isMinTimeLimit(setMinExamTime,minExamTime,isShowAlert){
        var canSubmit=true;
        $.ajax( {
            type:"post",
            url:"/exam/get_remian_time",
            dataType:"json",
            data: "examResultId="+exam_results_id,
            async:false,
            success:function(msg){
                var consume_time =Math.abs(msg.consumeTime);
                $("#limitMinTimeCount").text(Math.ceil((minExamTime*60-consume_time)/60));
                //è‹¥è®¾ç½®äº†æœ€çŸ­ç­”é¢˜æ—¶é•¿ï¼Œä¸”ç­”é¢˜æ—¶é—´å°äºŽè¯¥æ—¶é•¿ï¼Œè¿”å›žä¸€ä¸ªfalse
                if(setMinExamTime&&consume_time<(minExamTime*60)){
                    if(isShowAlert){ //æ˜¯å¦è¦æ˜¾ç¤ºæç¤º
                        showMinTimeLimitAlert();
                    }
                    canSubmit=false;
                }
            }
        })
		canSubmit=true;
        return canSubmit;
    }
    //æ˜¾ç¤º'æœ€çŸ­ç­”é¢˜æ—¶é•¿'æç¤º
    function showMinTimeLimitAlert(){
        $('#minTimeLimitAlert').removeClass('hidden');
        var minTimeLimitTimeout=setTimeout(function(){
            $('#minTimeLimitAlert').addClass('hidden');
            clearTimeout(minTimeLimitTimeout);
        },3000);
    }

    // å¢žåŠ é—®é¢˜é€‰é¡¹-å¡«ç©ºé¢˜
    function addBlankQuestionItem(data,num) {
        var html='';
        if (data['answer'+String(num)] != undefined) {
            html =
                '<div class="filled">' +
                '    <div class="input-group">' +
                '        <span class="input-group-addon">'+String(num)+'</span>' +
                '        <textarea name="key'+String(num)+'" data-type="' + data.type + '" class="keyFill form-control" onpaste="return false" oncopy="return false">' + data['test_ans'+String(num)] + '</textarea>' +
                '    </div>' +
                '</div>';
        }
        return html;
    }



});

//*******************************************ç­”é¢˜å¡ä¼˜åŒ–********************************************

//æ–°ç­”é¢˜å¡-æ”¶èµ·
$("#answercardFoldBtn").click(function(){
    $("#answercardOpenBtn").show();
    $(this).hide();
    $("#numberCardModal .card-content").hide();
    $("#numberCardModal .modal-footer").hide();
    $("#numberCardModal .title_border").css({
        width: '18px',
        height: '4px',
        top: '-6px',
        margin: '0',
    });
    $("#numberCardModal .title").css("padding-top","4px");
    $("#numberCardModal .title_content").css("margin-left","unset").css("width","12px");
    $("#numberCardModal").css("width","66px");
});
//æ–°ç­”é¢˜å¡-å±•å¼€
$("#answercardOpenBtn").click(function(){
    $("#answercardFoldBtn").show();
    $(this).hide();
    $("#numberCardModal .card-content").show();
    $("#numberCardModal .modal-footer").show();
    $("#numberCardModal .title_border").css({
        width: '4px',
        height: '18px',
        top: '0px',
        margin: 'auto',
    });
    $("#numberCardModal .title").css("padding-top","0px");
    $("#numberCardModal .title_content").css("margin-left","10px").css("width","unset");
    $("#numberCardModal").css("width","240px");
});
//æ‰“å¼€ç›‘æŽ§çš„æ—¶å€™
$(function(){
    if($("#webcam").length!=0) {
        $("#numberCardModal").css("height", "calc(100% - " + (110 + 173).toString() + "px)").css("top", (90 + 173).toString() + "px"); //ç­”é¢˜å¡çš„é«˜åº¦å’Œä½ç½®è°ƒæ•´
    }
})
//*******************************************åˆ‡å±ä¼˜åŒ–********************************************
//åˆ‡å±æ¬¡æ•°å‘ç»™åŽç«¯
function sendCuttingScreenCount(count){
    $.ajax({
        type:"POST",
        cache:false,
        dataType:"json",
        headers:{ "cache-control": "no-cache" },
        url:'/exam/update_cutting_count',
        data:"switchScreen="+count+"&examResultsId="+exam_results_id,
    });
}

//è®¾ç½®cookieä¿å­˜åˆ‡å±çŠ¶æ€
function setSwitchScreenCookie(){
    setCookieByMaxAge('switch_screen_status'+exam_results_id,'1',switchScreenSecond.toString(),'/');
}