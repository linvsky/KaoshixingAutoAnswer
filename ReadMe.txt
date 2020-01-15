Prerequisites
1. Install Python 2.7
2. curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
3. python get-pip.py
4. pip install beautifulsoup4 simplejson zhon
5. Install Fiddler

Steps
1. Setup Fiddler
	1.1 Click "Decode" button in toolbar
	1.2 Switch to "AutoResponder" tab
		1) Check "Enable Rules"
		2) Check "Unmatched requests passthrough"
		3) Add Rule
			1) Set request as: static/exam/js/exam_answer.js
			2) Find the manipulated_exam_answer.js for response
2. In Fiddler press F12 to start capture
3. Use Chrome to open exam web page (exam started)
4. Save exam webpage into HTML only file by clicking on Chrome -> More Tools ->  Save page as -> src.html
5. Copy cookie from Fiddler and save into a cookie.txt file
6. In Fiddler press F12 to stop capture
7. Copy examResultId, examInfoId from Fiddler
8. Run auto_answer.py with the parameters of: questionbank.json, src.html, cookie,txt, examResultId, examInfoId
	8.1 Use BeautifulSoap to parse src.html to extract all exam questions
	8.2 Find answers for all exam questions in question bank
	8.3 Send HTTP POST for each exam question (URL is https://exam.kaoshixing.com/exam/exam_start_ing_multi)
9. Submit exam and enjoy 100 score and only took 1 minutes!


******************************************
********** Example: HTTP POST **********
******************************************
POST https://exam.kaoshixing.com/exam/exam_start_ing_multi HTTP/1.1
Host: exam.kaoshixing.com
Connection: keep-alive
Content-Length: 205
Accept: application/json, text/javascript, */*; q=0.01
Origin: https://exam.kaoshixing.com
X-Requested-With: XMLHttpRequest
DNT: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36
X-Tingyun-Id: YfNlX9ebdkc;r=646638659
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: cors
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9
Cookie: gr_user_id=8a98040a-b2c0-4ede-9c09-8f9b29b85954; grwng_uid=170d9b6d-ce9c-431d-a467-bfc53b30ab26; kwd=%E6%9C%AA%E7%9F%A5; source=5FG4jd63b9SGDn92HERnf0ERGe83nr74bf84nf; Hm_lvt_0502cfa1e2a3555b1fd1668ef723940d=1576550260; Hm_lpvt_0502cfa1e2a3555b1fd1668ef723940d=1576550380; 87d10bc8158a4ed0a2206a6f0bdd2a5c_gr_last_sent_cs1=11194102; JSESSIONID=aaay10V0phjd1dLGe_d8w; KSX_CID=177425; TY_SESSION_ID=3f57e40a-caaa-493d-9627-9e0b6545e92f; sessionId=aaay10V0phjd1dLGe_d8w; processUrl=v; 87d10bc8158a4ed0a2206a6f0bdd2a5c_gr_session_id=352c7acb-17bc-49c8-a638-929917356039; 87d10bc8158a4ed0a2206a6f0bdd2a5c_gr_last_sent_sid_with_cs1=352c7acb-17bc-49c8-a638-929917356039; 87d10bc8158a4ed0a2206a6f0bdd2a5c_gr_session_id_352c7acb-17bc-49c8-a638-929917356039=true; 87d10bc8158a4ed0a2206a6f0bdd2a5c_gr_cs1=11194102

examTestList=%5B%7B%22test_id%22%3A%225df840224cc1162c917bf906%22%2C%22test_ans%22%3A%22key1%2C%22%2C%22exam_results_id%22%3A%2225148773%22%2C%22exam_info_id%22%3A%22393430%22%7D%5D&timeStamp=1576646638658



********** Example: original request data **********
[{"test_id":"5df840224cc1162c917bf907","test_ans":"key2,","exam_results_id":"25113836","exam_info_id":"393430"}]



********** Example 1: original Cookie **********
	gr_user_id=8a98040a-b2c0-4ede-9c09-8f9b29b85954
	grwng_uid=170d9b6d-ce9c-431d-a467-bfc53b30ab26
	kwd=%E6%9C%AA%E7%9F%A5
	source=5FG4jd63b9SGDn92HERnf0ERGe83nr74bf84nf
	Hm_lvt_0502cfa1e2a3555b1fd1668ef723940d=1576550260
	Hm_lpvt_0502cfa1e2a3555b1fd1668ef723940d=1576550380
	87d10bc8158a4ed0a2206a6f0bdd2a5c_gr_last_sent_cs1=11194102
	JSESSIONID=aaay10V0phjd1dLGe_d8w
	KSX_CID=177425
	TY_SESSION_ID=3f57e40a-caaa-493d-9627-9e0b6545e92f
	sessionId=aaay10V0phjd1dLGe_d8w
	processUrl=v
	87d10bc8158a4ed0a2206a6f0bdd2a5c_gr_session_id=352c7acb-17bc-49c8-a638-929917356039
	87d10bc8158a4ed0a2206a6f0bdd2a5c_gr_last_sent_sid_with_cs1=352c7acb-17bc-49c8-a638-929917356039
	87d10bc8158a4ed0a2206a6f0bdd2a5c_gr_session_id_352c7acb-17bc-49c8-a638-929917356039=true
	87d10bc8158a4ed0a2206a6f0bdd2a5c_gr_cs1=11194102
