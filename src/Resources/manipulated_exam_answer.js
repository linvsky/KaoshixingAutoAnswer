$(function () {
    var getExamEndTimeInterval; //èŽ·å–è€ƒè¯•æ—¶é—´çš„å®šæ—¶å™¨ï¼Œåœ¨äº¤å·åŽéœ€è¦æ¸…é™¤è¯¥å®šæ—¶å™¨

    // æ˜¯å¦å¼ºåˆ¶äº¤å·
    var isForce;
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
                    $(".questions-content").css({
                        'background-image': 'url('+msg.bizContent+')'
                    });
                }
            }
        });
    }
    //è®¡æ—¶

    // äº¤å·æ—¶é—´
    var d = new Date();
    var initTime = parseInt(d.getTime()/1000);
    //è€ƒè¯•ç»“æŸæ—¶é—´ç‚¹
    var endTime = initTime + answer_time_left*2;

    //  è€ƒè¯•æ—¶é—´å€’è®¡æ—¶
    // éž"ä¸é™æ—¶é•¿"ç±»çš„è€ƒè¯•ï¼ŒèŽ·å–å€’è®¡æ—¶
    if(examTimeRestrict != 0){

        timeDownInterval = setInterval(timeDown,1000);
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
            saveExamFn(0);//è€ƒè¯•æ—¶é—´åˆ°
        }

        answer_time_left = answer_time_left - 1;

        // if(answer_time_left==10){
        //     $("#timeDown").addClass("warning");
        // }

        $("#timeDown").text(formatTime(leftTime));
    }


    //å¿ƒè·³é“¾æŽ¥
        // æ¯30ç§’è¯·æ±‚ä¸€æ¬¡è€ƒè¯•æ—¶é—´
        // éž"ä¸é™æ—¶é•¿"ç±»çš„è€ƒè¯•ï¼ŒèŽ·å–å€’è®¡æ—¶
        if(examTimeRestrict != 0){
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
                    // $("#spinnerLoading").removeClass("hide");

                    if(msg.success){
                        //code:0 æœªè®¾ç½®ï¼Œä¸æ“ä½œ
                        //code:1 é‡æ–°è®¾ç½®æ—¶é—´
                        //code:2 ç«‹å³äº¤å·
                        //code:3 æ‰¹é‡äº¤å·
                        if(msg.bizContent.code=='3'){
                            $('.submit-notice').show();
                            var endNum = 3;
                            var submitExam = setInterval(function(){
                                endNum--;
                                if(endNum < 0){
                                    clearInterval(submitExam);
                                    $('.submit-notice').hide();
                                    saveExamFn(6);//ç«‹å³äº¤å·->æ‰¹é‡äº¤å·3ç§’å»¶è¿Ÿ

                                }
                                $('.notice-time').text(endNum)

                            },1000);
                        }

                        if(msg.bizContent.code=='1'){

                            if(answer_time_left !=msg.bizContent.totalTime){
                                d = new Date();
                                initTime = parseInt(d.getTime()/1000);
                                answer_time_left = msg.bizContent.totalTime;
                                endTime = initTime + answer_time_left;

                                $("#timeResetModal .delay-time").text(msg.bizContent.delayTimeStamp);
                                $('#timeResetModal').modal();
                            }


                        }else if(msg.bizContent.code=='2'){
                            saveExamFn(0);//ç«‹å³äº¤å·
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

    // æ ¼å¼åŒ–æ—¶é—´
    function formatTime(time) {
        var day = Math.floor(time/86400);
        var day_left=time-86400*day;
        var hour = Math.floor(day_left/3600);
        var hour_left=day_left-3600*hour;
        var minutes= Math.floor(hour_left/60);
        var seconds= hour_left-60*minutes;
        var time_show=(day==0?'':(day+'å¤©:'))+(hour<10?'0'+hour:hour)+':'+(minutes<10?'0'+minutes:minutes)+
            ':'+(seconds<10?'0'+seconds:seconds);

        return time_show;
    }

    //**************************************ç­”æ¡ˆå­˜å‚¨**************************************
    var answered_num = 1; //å·²ç­”æœªä¿å­˜è€ƒé¢˜æ•°é‡
    var answered_multi_all = []; //æ‰€ä»¥è¯•é¢˜å»¶æ—¶æäº¤æ•°æ®
    var answered_all = [];

    //åˆå§‹åŒ–ç­”é¢˜è¿›åº¦
    commitProcess();

    //å¤„ç†aliyuné™„ä»¶urlé—®é¢˜ï¼Œè¿›è¡Œuriç¼–ç 
    $(".question-content .answers .filled .file-row a").each(function (index, element) {
        var url = aliyunEncodeURI($(this).attr("href"));
        $(this).attr("href", url).attr("download", url).attr("target", "_blank");
    });


    //ç”Ÿæˆæ¯ä¸ªç¼–è¾‘å™¨,blurå­˜å‚¨
    $('.keyCloze').each(function () {
        var keyCloze = this;
        var editor = new wangEditor(keyCloze);
        var _parent = $(keyCloze).parents('.question-content');
        var questionsId = _parent.attr('data-id');
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
                var keyList = editor.$txt.html();
                $(keyCloze).parents('.wangEditor-container').next().val(keyList);
                saveQuestionsCatch(questionsId, keyList, false, true);
            }
        })
    });


    var isUploading = 0; // 1ä¸ºé™„ä»¶æ­£åœ¨ä¸Šä¼ ä¸­ï¼›0ä¸ºé™„ä»¶å·²ç»ä¸Šä¼ å®Œæˆï¼ˆé™„ä»¶ä¸Šä¼ å®ŒæˆåŽï¼Œæ‰å¯ä»¥äº¤å·ï¼‰
    //é—®ç­”é¢˜ä¸Šä¼ é™„ä»¶
    $(".question-content .wang-upload-file").change(function () {
        isUploading = 1;
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
            isUploading = 0;
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
                    showSuccessTip("é™„ä»¶ä¸Šä¼ æˆåŠŸ");
                } else if(msg.code == 33000) {
                    showErrorTip("æ–‡ä»¶å¤§å°è¶…é™");
                } else {
                    showErrorTip('ä¸Šä¼ å¤±è´¥ï¼Œè¯·é‡è¯•');
                }
            }
        });

    });

    //é—®ç­”é¢˜ä¸Šä¼ é™„ä»¶åˆ é™¤
    $("body").on("click", ".file-list .icon-file-delete", function () {
        var _parent = $(this).parents(".question-content");
        var _row = $(this).parents(".file-row");
        var fileUrl = $(_row).find(".file").attr("href");
        var questionsId = _parent.attr("data-id");
        var upload_file=[];
        _parent.find('.file-row').each(function(){
            var file;
            var url=$(this).find(".file").attr("href");
            var name=$(this).find(".file").text();
            if(fileUrl!=url) { //éåŽ†ï¼Œå–å‡ºæœªè¦åˆ é™¤çš„æ–‡ä»¶åˆ—è¡¨ï¼Œä¼ ç»™åŽç«¯
                file = {
                    filename: name,
                    url: decodeURIComponent(url)
                };
                upload_file.push(file);
            }
        })
        var timeStamp = new Date().getTime();
        var questionsData ={
            test_id: questionsId,
            upload_file: JSON.stringify(upload_file),
            exam_results_id: exam_results_id,
            exam_info_id: exam_info_id,
            time_stamp: timeStamp
            };
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/exam/alter_paper_records_file",
            data: questionsData,
            success: function(msg){
                if (msg){
                    $(_row).remove();
                }else{
                    showErrorTip('åˆ é™¤å¤±è´¥');
                }
            },
            error: function () {
                showErrorTip('æœåŠ¡å™¨å¼‚å¸¸ï¼Œç¨åŽå†è¯•');
            }
        })
    });


    //å•é€‰ï¼Œå¤šé€‰ï¼Œåˆ¤æ–­
    //ä¹‹æ‰€ä»¥å°†äº‹ä»¶ç»‘å®šè‡³labelè€Œä¸æ˜¯.selectï¼Œæ˜¯å› ä¸ºselectå†…åŒæ—¶åŒ…å«inputå’Œlabelï¼Œ
    //è€ŒlabelåˆæŒ‡å‘inputï¼Œè¿™ä¼šå¯¼è‡´ç‚¹å‡»selectï¼Œclickè¢«è§¦å‘ä¸¤æ¬¡
    $(".question-content .select label").click(function(e) {
        var _this = $(this);
        var _parent = $(_this).parents(".question-content");
        var _select = $(_this).parents(".select");
        var questionsId = _parent.attr("data-id");
        var keyList = "";

        setTimeout(function () {
            if($(_select).hasClass("single-select")||$(_select).hasClass("judge")){
                $(_parent).find(".radioOrCheck").each(function(index, element) {
                    if($(this).is(":checked")){
                        keyList = $(this).attr("data-name")+",";
                    }
                });
            }else if($(_select).hasClass("multi-select")){
                $(_parent).find(".radioOrCheck").each(function(index, element) {
                    if($(this).is(":checked")){
                        keyList += $(this).attr("data-name")+",";
                    }
                });
            }

            saveQuestionsCatch(questionsId , keyList);
        }, 100);

    });

    //å¡«ç©º
    $(".keyFill").blur(function(e) {
        var _parent = $(this).parents(".question-content");
        var questionsId = _parent.attr("data-id");
        var keyFillDom = _parent.find(".keyFill");
        var keyList = [];

        $(_parent).find(".keyFill").each(function (index, element) {
            keyList[index] = $(this).val();
        });

        saveQuestionsCatch(questionsId , keyList.join("||"));

    });

    //todo è¢«åˆ é™¤çš„è¯•é¢˜å½“ä½œå·²ç­”ï¼Ÿï¼Ÿï¼Ÿ

    //äº¤å·
    $("#endExamBtn").click(function (e) {
        e.preventDefault();

        //äº¤å·æç¤º
        var length = $("#numberCardModal .modal-body .box.s1").length;
        var html = "";

        if(length==0){
            html = "æ˜¯å¦çŽ°åœ¨äº¤å·ï¼Ÿ";
        }else {
            html = "æœ‰è¯•é¢˜æœªå®Œæˆï¼Œæ˜¯å¦çŽ°åœ¨äº¤å·ï¼Ÿ";
        }

        $("#endExamModal .modal-title").html(html);
        $("#endExamModal").modal("show");
    });

    var loadingProgress = 0; //è¿›åº¦æ¡æ•°å€¼
    var loadingText = ''; //ä¸åŒç™¾åˆ†æ¯”æ˜¾ç¤ºå†…å®¹
    var progress; //è¿›åº¦æ¡å®šæ—¶å™¨

    //ç¡®è®¤äº¤å·
    $("#confirmEndExamBtn").click(function (e) {
        e.preventDefault();

        //æœ€çŸ­ç­”å·æ—¶é•¿åˆ¤æ–­
        if(!isMinTimeLimit(setMinExamTime,minExamTime,true)){
            $('#endExamModal').modal("hide");
            $("#spinnerLoading").addClass('hide');
            return false;
        }
        saveExamFn(0);//ç”¨æˆ·ä¸»åŠ¨ç‚¹å‡»è§¦å‘äº¤å·


        
        //ç›‘å¬é¡µé¢åˆ‡æ¢
        var hiddenTime;
        var statTime = 0;
        var hiddenNum = 0;
        var makeSureTime  = setInterval(function () {
            statTime++
        },1000);

        $('#endExamModal').modal("hide");
        $("#spinnerLoading").addClass('hide');

        //é¡µé¢åˆ‡æ¢ä¸å¯è§çš„æƒ…å†µä¸‹
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

    window.saveExamFn=saveExamFn;
    //äº¤å·æäº¤åŽå°å¼‚æ­¥ä¿å­˜fn
    // isForce--æ˜¯å¦å¼ºåˆ¶äº¤å·ï¼Œå¼ºåˆ¶äº¤å·æ–¹å¼ //0--å¦ 1--æ˜¯ 2--åˆ‡å±é˜²ä½œå¼Š 3--xç§’ä¸åŠ¨è‡ªåŠ¨äº¤å· 4--é—¯å…³å¤±è´¥ 5--ç­”é¢˜æ—¶é—´æˆ–è€…è€ƒè¯•æ—¶é—´å·²åˆ° 6-æ‰¹é‡äº¤å·3ç§’åŽäº¤å·
    function saveExamFn(isForce){
        //å¦‚æžœé™„ä»¶æ­£åœ¨ä¸Šä¼ ä¸­ //éžå¼ºåˆ¶äº¤å·
        if(isUploading == 1){
            if(isForce == 0){
                BootstrapDialog.show({
                    title: "",
                    message: "é™„ä»¶æ­£åœ¨ä¸Šä¼ ä¸­ï¼Œè¯·æ‚¨è€å¿ƒç­‰å€™ã€‚ä¸Šä¼ å®ŒæˆåŽæ˜¯å¦è‡ªåŠ¨ä¸ºæ‚¨äº¤å·ï¼Ÿ",
                    buttons: [{
                        label: "å¦",
                        action: function(dialogItself) {
                            dialogItself.close();
                            $("#endExamModal").modal("hide");
                            $("#spinnerLoading").addClass("hidden");
                        }
                    },{
                        label: "æ˜¯",
                        cssClass: 'btn-primary',
                        action: function(dialogItself) {
                            dialogItself.close();
                            $("#spinnerLoading").removeClass("hidden hide");
                            setInterval(function () {
                                if(isUploading == 0){
                                    saveExamFn(isForce);
                                }
                            },1000);
                        }
                    }]
                });
            }
            return false;
        }



        $(".had-save-mark").addClass("had-confirm-save");//ä½œä¸ºæ˜¯å¦å·²ç»è§¦å‘äº¤å·æ“ä½œçš„æ ‡è®°
        $("#spinnerLoading").addClass("hidden");
        $('.loading-box').removeClass('hidden');

        //æ¸…é™¤è€ƒè¯•æ—¶é—´
        // éž"ä¸é™æ—¶é•¿"ç±»çš„è€ƒè¯•ï¼ŒèŽ·å–å€’è®¡æ—¶
        if(examTimeRestrict != 0) {
            clearInterval(timeDownInterval);
        }
        // è‹¥å¼€å¯æ‹ç…§é˜²ä½œå¼ŠåŠŸèƒ½ï¼Œåˆ™åœ¨äº¤å·ä¹‹å‰å†æ‹ä¸€æ¬¡ï¼Œç¡®ä¿è‡³å°‘æœ‰ä¸€å¼ 
        if(capture==-1){
            var questionId=$("#numberCardModal .modal-body .iconBox:last").attr("questionsId");
            $("#captureForm input[name=questionId]").val(questionId);
            webcam.capture(0);
        }

        //åˆ¤æ–­æ˜¯å¦æœ‰æœªä¿å­˜çš„è€ƒé¢˜
        $.each(answered_multi_all,function(index,value){
            var unsaved_answer = value;
            var has_save = false;
            $.each(answered_all,function(index,value){
                if(value.test_id==unsaved_answer.test_id){
                    value.test_ans = unsaved_answer.test_ans;
                    has_save = true;
                    $("#spinnerLoading").addClass("hidden");
                    return false;
                }
            });
            if(!has_save){
                answered_all.push(unsaved_answer);
            }
        });

        if(answered_all.length>0){
            saveQuestionsCatch("","",true,false,isForce);
            $("#spinnerLoading").addClass("hidden");

            return false;
        }else{
            commit_exam(isForce);
        }
    }

    //ç¼“å­˜å·²ç­”æœªæäº¤è€ƒé¢˜æ•°æ®
    function saveQuestionsCatch(questionsId,keyList,overExam,editor_blur,isForce){
        keyList = keyList.replace(/"/g,"&quot;").replace(/'/g,"&apos;");
        //é—®ç­”é¢˜blurä¿å­˜ç­”æ¡ˆ
        if(editor_blur==true){
            var questionsData = {
                "test_id":questionsId,
                "test_ans":keyList,
                "exam_results_id":exam_results_id,
                "exam_info_id":exam_info_id
            };
            answered_multi_all.push(questionsData);
            commitProcess(questionsId, true);
            saveAnswerFn_timeout(isForce);
            return;
        }
        //äº¤å·æ“ä½œæ—¶è¿˜æœ‰æœªä¿å­˜çš„è€ƒé¢˜
        if(overExam==true){
            saveAnswerFn_timeout(isForce,overExam);
            return;
        }
        var hasSave = false; //æ˜¯å¦ä¿å­˜è¿‡
        $.each(answered_multi_all,function(index,value){
            if(value.test_id==questionsId){
                value.test_ans = keyList;
                hasSave = true;
                return;
            }
        });
        var questionsData = {
            "test_id":questionsId,
            "test_ans":keyList,
            "exam_results_id":exam_results_id,
            "exam_info_id":exam_info_id
        };
        if(!hasSave){
            answered_multi_all.push(questionsData);
            if(questionsData.test_ans==''){
                commitProcess(questionsId, false);
            }else {
                commitProcess(questionsId, true);
            }
        }
        if(answered_multi_all.length==answered_num){
            saveAnswerFn_timeout(isForce);
        }
    }

    //å»¶æ—¶ç­”é¢˜åŽæäº¤åŽå°å¼‚æ­¥ä¿å­˜fn
    function saveAnswerFn_timeout(isForce,overExam){

        if(examTimeRestrict != 0){
            clearInterval(getExamEndTimeInterval);
        }

        var exam_test_list_json, exam_test_list;
        //ç­”æ¡ˆæ•°ç»„
        if(overExam){
            exam_test_list_json = answered_all;
        }else{
            exam_test_list_json = answered_multi_all;
            answered_multi_all = [];
        }
        exam_test_list = JSON.stringify(exam_test_list_json);
        //å°†åˆ†å‰²URIçš„&ç¬¦å·è½¬ä¹‰ä¸ºåå…­è¿›åˆ¶åºåˆ—
        exam_test_list = encodeURIComponent(exam_test_list);

        //æ—¶é—´æˆ³
        var timeStamp = new Date();
        var dataForm = "examTestList="+exam_test_list+"&timeStamp="+timeStamp.getTime();

        $("#spinnerLoading").addClass("hide");
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/exam/exam_start_ing_multi",
            data: dataForm,
            processData: false,
            success: function(msg){

                $("#spinnerLoading").removeClass("hide");

                if(msg.success == "answered") {
                    saveExamFn(6);
                    return;
                }

                if(msg.success=='true'){
                    if(overExam==true){
                        answered_all = [];
                        commit_exam(isForce);
                    }

                    if(examTimeRestrict != 0){
                        if(msg.endTimeMap.code=='3'){
                            $('.submit-notice').show();
                            var endNum = 3;
                            var submitExam = setInterval(function(){
                                endNum--;
                                if(endNum < 0){
                                    clearInterval(submitExam);
                                    $('.submit-notice').hide();
                                    saveExamFn(6);//ç«‹å³äº¤å·->æ‰¹é‡äº¤å·3ç§’å»¶è¿Ÿ
                                }
                                $('.notice-time').text(endNum)
                            },1000);
                        }
                        if(msg.endTimeMap.code=='1'){
                            if(answer_time_left !=msg.endTimeMap.totalTime){
                                d = new Date();
                                initTime = parseInt(d.getTime()/1000);
                                answer_time_left = msg.endTimeMap.totalTime;
                                endTime = initTime + answer_time_left;
                                $("#timeResetModal .delay-time").text(msg.endTimeMap.delayTimeStamp);
                                $('#timeResetModal').modal();
                            }
                        }else if(msg.endTimeMap.code=='2'){
                            saveExamFn(0);//ç«‹å³äº¤å·
                        }
                        if(msg.endTimeMap.code !== '2'|| msg.endTimeMap.code !== '3') {
                            getExamEndTimeInterval = setInterval(heartAjax, 30000);
                        }
                    }

                }else if(msg.success=="answered"){
                    $('.laoding-box').hide();
                    alert("æ‚¨å·²äº¤å·ï¼Œè¯·å…³é—­é¡µé¢");

                }else{
                    $('.laoding-box').hide();
                    alert("æ“ä½œå¤±è´¥ï¼Œè¯·è”ç³»ç®¡ç†å‘˜ï¼");
                }
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
                // $("#spinnerLoading").removeClass("hide");
                $.each(exam_test_list_json,function(index,value){
                    var fail_answer = value;
                    var has_save = false;

                    $.each(answered_all,function(index,value){
                        if(value.test_id==fail_answer.test_id){
                            value.test_ans = fail_answer.test_ans;
                            has_save = true;
                            return false;
                        }
                    });

                    if(!has_save){
                        answered_all.push(fail_answer);
                    }
                });
                asynSubTimeoutFn(exam_test_list_json);
            }
        });
    }

    //æŸ¥è¯¢æˆç»©æ—¶é—´é—´éš”
    var queryInterval;
    var resultTime = 2; //è¯·æ±‚è€ƒè¯•ç»“æžœçš„é—´éš”æ—¶é—´
    var examTimeOut = 0; //äº¤å·è¶…æ—¶è®¡æ—¶ä¾èµ–å€¼
    var examTimeOutClock; // äº¤å·è¶…æ—¶è®¡æ—¶å™¨

    //äº¤å·
    function commit_exam(isForce){

        var switchScreen = 0;//åˆ‡å±æ¬¡æ•°
        var noOpsAutoCommit = 0;//æ— æ“ä½œæ—¶é—´
        switch(isForce) {
            case 2:
                switchScreen = parseInt(blur_count) + 1;
                break;
            case 3:
                noOpsAutoCommit = quietSecond+10000;
                break;
            default:
                break;
        }

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

        },120);
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
                    },120);
                }else {
                    resultTimeout();
                }
            },
            error: function () {
                resultTimeout();
            }
        });
    }
    //å¼‚æ­¥æäº¤ç­”æ¡ˆè¶…æ—¶FN
    function asynSubTimeoutFn(data){

        $.each(data,function(index,value){
            var questionsId = value.test_id;
            commitProcess(questionsId, false);

        });
        alert("ç½‘ç»œè¿žæŽ¥ä¸ç¨³å®šï¼Œè¯·æ‚¨åˆ·æ–°é¡µé¢é‡è¯•ã€‚");
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

    //ç‚¹å‡»ç­”é¢˜å¡è·³è½¬è‡³å¯¹åº”é¢˜,ä½¿ç”¨äº†é”šç‚¹è·³è½¬
    //ä½ç½®è°ƒæ•´90ï¼ˆå› ä¸ºæœ‰é¡¶æ ï¼‰ï¼Œå¹¶å…³é—­ç­”é¢˜å¡
    $("#numberCardModal .modal-body .box").click(function (e) {

        $("#numberCardModal").modal('hide');
        setTimeout(function () {
            var scrollTop = $("html").scrollTop();

            $("html").animate({scrollTop:scrollTop-90},200);
        },100);

    });


    //å›ºå®šç»„åˆé¢˜
    var $body = $("body");
    var $main = $('.main');
    var parentsHeight= 0,
        fixedHeight=0,
        scrollHeight = 0,
        goBottomHeight = 0;
    var $questionList;
        $main.scroll(function(){

            //ä¸Šæ»‘æ—¶
            if($main.scrollTop() < scrollHeight ){
                $questionList.css({
                    'marginTop':0
                });
                    getEle();
                    scrollHeight = 0;

            }
            //goBottomHeightä¸ä¸º0æ—¶åœ¨è¿›è¡Œæ¯”è¾ƒ
            if(goBottomHeight){

                if($main.scrollTop() > goBottomHeight){
                    $questionList.css({
                        'marginTop':0
                    });
                    getEle();
                    goBottomHeight = 0

                }
            }
        });
    // å³ä¾§å›¾æ ‡æ ·å¼è®¾å®š
    function getEle(){
        var tagetEle =  $('.operation-icon.icon-pushpined');
        tagetEle.parent().removeClass('isStuck').removeClass('stuckMenu ').attr('style','');

        tagetEle.find(".icon").removeClass("icon-p_exam_fix_se").addClass("icon-p_exam_fix_de");

        tagetEle.removeClass("icon-pushpined").addClass("icon-pushpin")
            .attr("title","å›ºå®šé¢˜å¹²").attr("data-original-title","å›ºå®šé¢˜å¹²");
    }

      //å›ºå®šé¢˜å¹²
    $body.on("click", ".operation-icon.icon-pushpin", function () {



        var index = $(this).parents('.questions').index();

        // //èŽ·å–question-insert-list
         $questionList = $(this).parents('.questions-detail').find('.question-insert-list');

        //èŽ·å–æ¯ä¸ªç»„åˆé¢˜ç¬¬ä¸€ä¸ªå°é¢˜çš„é«˜åº¦
        var labelHeight = $questionList.find('.question-insert').eq(0).find('.exam-question').height();

        //èŽ·å–questions-detailçš„offsetTopå€¼
        var questionTop = $(this).parents('.questions-detail').offset().top;

        //èŽ·å–mainçš„scrollTopå€¼
        var mainScrollTop = $main.scrollTop();

            parentsHeight = $questionList.height();

            fixedHeight = $(this).parent().height();

            //èŽ·å–ä¸´ç•Œå€¼
            if(index === 0){
                $questionList.css({
                    'marginTop':fixedHeight-40
                })
            }
            //å‘ä¸‹å–æ•´
            scrollHeight =Math.floor(mainScrollTop+questionTop-fixedHeight-labelHeight-90);

        //ä¸‹æ»‘è¶…å‡ºé«˜åº¦
            goBottomHeight = Math.floor(scrollHeight+fixedHeight+parentsHeight+labelHeight-90);

            $main.scrollTop(scrollHeight);

            $(this).parent().stickUp({});

            $(this).parent().addClass('isStuck').css({
                position:'fixed',
                top:0
            });

        // $(".stuckMenu.isStuck").removeClass("isStuck").removeClass("stuckMenu").attr("style","");

        $(this).removeClass("icon-pushpin").addClass("icon-pushpined")
            .attr("title","è§£é”é¢˜å¹²").attr("data-original-title","è§£é”é¢˜å¹²");

        $(this).find(".icon").removeClass("icon-p_exam_fix_de").addClass("icon-p_exam_fix_se");

        // $(this).parents(".question-comb").stickUp();

    });

    //å–æ¶ˆå›ºå®š
    $body.on("click", ".operation-icon.icon-pushpined", function () {

        $questionList.css({
            'marginTop':0
        });

        $(this).parent().removeClass('isStuck').removeClass('stuckMenu ').attr('style','');

        // $(".stuckMenu.isStuck").removeClass("isStuck").removeClass("stuckMenu").attr("style","");

        $(this).removeClass("icon-pushpined").addClass("icon-pushpin")
            .attr("title","å›ºå®šé¢˜å¹²").attr("data-original-title","å›ºå®šé¢˜å¹²");

        $(this).find(".icon").removeClass("icon-p_exam_fix_se").addClass("icon-p_exam_fix_de");

        $(".question-insert-list").css("margin-top",0);
    });

    //æ ‡è®°è¯•é¢˜
    $body.on("click", ".operation-icon.icon-mark", function () {
        var questionId = $(this).parents(".question-content").attr("data-id");

        $(this).removeClass("icon-mark").addClass("icon-marked")
            .attr("title","å–æ¶ˆæ ‡è®°").attr("data-original-title","å–æ¶ˆæ ‡è®°");
        $(this).find(".icon").removeClass("icon-p_exam_tag_de").addClass("icon-p_exam_tag_se");
        $("#numberCardModal a.questions_"+questionId).parent(".box").addClass("marked");
        $("#numberCardModal a.questions_"+questionId).parent(".box").find(".question_marked").show();
    });

    //å–æ¶ˆæ ‡è®°
    $body.on("click", ".operation-icon.icon-marked", function () {
        var questionId = $(this).parents(".question-content").attr("data-id");

        $(this).removeClass("icon-marked").addClass("icon-mark")
            .attr("title","æ ‡è®°æœ¬é¢˜").attr("data-original-title","æ ‡è®°æœ¬é¢˜");
        $(this).find(".icon").removeClass("icon-p_exam_tag_se").addClass("icon-p_exam_tag_de");
        $("#numberCardModal a.questions_"+questionId).parent(".box").removeClass("marked");
        $("#numberCardModal a.questions_"+questionId).parent(".box").find(".question_marked").hide();
    });


    //åˆ é™¤å½•éŸ³
    $body.on('click',".audio-list .icon-audio-delete",function(e) {
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
                }else{
                    showErrorTip("åˆ é™¤å¤±è´¥");
                }
            }
        });
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
                    console.log(webcam_json);
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
                //ç»„åˆé¢˜é¢˜å¹²æŽ’é™¤
                if(!$(this).hasClass("question-comb")){
                    var questionId = $(this).attr("data-id");

                    if(typeof(webcam_json[questionId])!='undefined' && webcam_json[questionId]==0) {
                        webcam_json[questionId] = 1;
                        $("#captureForm input[name=questionId]").val(questionId);
                        webcam.capture(0);
                    }
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
                if(!$(e.target).hasClass("webcam-refresh")){
                    //å½“ä¸”ä»…å½“é¡µé¢å¤„äºŽéžå…¨å±çŠ¶æ€æ—¶å†æ¬¡è§¦å‘å…¨å±è¯·æ±‚ï¼Œå¦åˆ™ï¼Œæ¯æ¬¡ç‚¹å‡»é¡µé¢éƒ½ä¼šå›žåˆ°é¡µé¢é¡¶éƒ¨
                    if(!screenfull.isFullscreen&&screenfull.enabled){
                        screenfull.request();
                        return false;
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

            //å¦‚æžœå·²ç»ç‚¹å‡»äº†äº¤å·ï¼Œä¸åšåˆ‡å±é˜²ä½œå¼Š
            if($(".had-save-mark").hasClass("had-confirm-save")){
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
                    clearInterval(screenLimitInterval);
                    cuttingScreenCount=0;
                    sendCuttingScreenCount(cuttingScreenCount);

                    if (cuttingScreenCount > parseInt(blur_count)) {
                        saveExamFn(2);
                    } else {
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
		canSubmit = true
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

    //æ— æ“ä½œé˜²ä½œå¼Š
    $(function () {
        //è‹¥å¹²ç§’æ— æ“ä½œæç¤ºï¼Œè‡ªåŠ¨äº¤å·
        if(setQuietCheat==-1){
            //é¢„ç•™10ç§’æç¤ºæ—¶é—´
            var maxTime = parseInt(quietSecond)+10000;
            var d = new Date();
            //å‰©ä½™æ—¶é—´æˆªæ­¢æ—¶é—´
            var restTime = parseInt(d.getTime()/1000) + maxTime;

            var timeLimitInterval=setInterval(function(){
                //å¦‚æžœå·²ç»ç‚¹å‡»äº†äº¤å·ï¼Œå–æ¶ˆå€’è®¡æ—¶
                if($(".had-save-mark").hasClass("had-confirm-save")){
                    clearInterval(timeLimitInterval);
                    return false;
                }
                var d = new Date();
                var restTimeLeft = restTime - parseInt(d.getTime()/1000);

                if(restTimeLeft<= 0) {
                    $("#timeLimitAlert").text("äº¤å·ä¸­...");
                    clearInterval(timeLimitInterval);
                    saveExamFn(3);
                }else if (restTimeLeft<=10) {
                    $("#limitTimeCount").text(restTimeLeft);
                    $("#timeLimitAlert").removeClass("hidden");
                }
                // restTime--;
            },1000);

            $("body").on('keydown click mousemove scroll', function(e){
                $("#timeLimitAlert").addClass("hidden");
                var d = new Date();
                // reset
                restTime = parseInt(d.getTime()/1000) + maxTime;
            });
        }
    })

    //**************************************é˜²ä½œå¼Š**************************************

});

//æç¤ºå¼¹çª—
function showSuccessTip(text){
    $(".ksx-success .text label").text(text);
    $(".ksx-success").show();
    $(".ksx-success").fadeOut(3000);
}
function showErrorTip(text){
    $(".ksx-error .text label").text(text);
    $(".ksx-error").show();
    $(".ksx-error").fadeOut(3000);
}
function showWarnTip(text){
    $(".ksx-warn .text label").text(text);
    $(".ksx-warn").show();
    $(".ksx-warn").fadeOut(3000);
}

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