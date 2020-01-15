# coding=utf-8
import sys

reload(sys)
sys.setdefaultencoding('utf8')
import urllib2
import os


class ExamApi(object):
    base_url = 'http://exam.kaoshixing.com'
    get_one_by_one_questions_url = '/exam/get_one_by_one_exam_question_info'
    submit_one_by_one_test_answer_url = '/exam/exam_start_ing'

    fixed_headers = {
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'DNT': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Tingyun-Id': 'YfNlX9ebdkc;r=823244724',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Accept-Language': 'en-US,en;q=0.9'
    }

    def __init__(self, cookie, base_url=None):
        self.cookie = cookie
        if base_url:
            self.base_url = base_url

    @staticmethod
    def parse_cookie(cookie_file_path):
        cookie_file_path = os.path.abspath(cookie_file_path)
        lines = []
        if os.path.exists(cookie_file_path):
            with open(cookie_file_path, mode='r') as cookie_file:
                line = cookie_file.readline()
                while line:
                    if '=' in line:
                        lines.append(line)
                    line = cookie_file.readline()

        lines = [line.strip() for line in lines]
        return '; '.join(lines)

    def get_one_by_one_questions(self, testIds, examInfoId, examResultsId):
        url = self.base_url + self.get_one_by_one_questions_url
        if isinstance(testIds, list):
            testIds = ','.join(testIds)
        values = {'testIds': testIds,
                  'examInfoId': examInfoId,
                  'examResultsId': examResultsId}
        values = "&".join(["%s=%s" % (k, v) for k, v in values.items()])
        headers = dict(self.fixed_headers)
        headers['Cookie'] = self.cookie
        headers['Content-Length'] = len(values)
        req = urllib2.Request(url, values, headers)
        response = urllib2.urlopen(req)
        questions_json_str = response.read()
        return questions_json_str

    def submit_one_by_one_test_answer(self, testId, testAns, examInfoId, examResultsId, checkedAnalysis='0'):
        url = self.base_url + self.submit_one_by_one_test_answer_url
        values = {'testId': testId,
                  'testAns': testAns,
                  'examInfoId': examInfoId,
                  'examResultsId': examResultsId,
                  'checkedAnalysis': checkedAnalysis}
        values = "&".join(["%s=%s" % (k, v) for k, v in values.items()])
        headers = dict(self.fixed_headers)
        headers['Cookie'] = self.cookie
        headers['Content-Length'] = len(values)
        req = urllib2.Request(url, values, headers)
        response = urllib2.urlopen(req)

    def submit_test_answer(self, testId, testAns, examInfoId, examResultsId, checkedAnalysis):
        raise NotImplemented('Will support in future')


if __name__ == '__main__':
    cookie = ExamApi.parse_cookie('TestData\cookie.txt')
    api = ExamApi(cookie)
    response = api.get_one_by_one_questions('5df840224cc1162c917bf919,5df840224cc1162c917bf91a', '395763', '25264310')
    print response
