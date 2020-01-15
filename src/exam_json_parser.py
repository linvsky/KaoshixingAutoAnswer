# coding=utf-8
import sys

reload(sys)
sys.setdefaultencoding('utf8')
import simplejson
import HTMLParser
from bs4 import BeautifulSoup


class ExamJSONParser(object):
    htmlParser = HTMLParser.HTMLParser()

    def __init__(self, exam_json_file_path):
        self.exam_json_file_path = exam_json_file_path

    def get_questions(self):
        question_matrix = {}
        with open(self.exam_json_file_path) as exam_json_file:
            exam_json = simplejson.load(exam_json_file, encoding='utf-8')
            for item in exam_json:
                question_id = item['test_id']
                question_matrix[question_id] = {}
                question_matrix[question_id]['title'] = ExamJSONParser.trim(item['question'])
                question_matrix[question_id]['answers'] = {}
                for attr in item:
                    if attr.startswith('answer'):
                        answer_key = ExamJSONParser.trim(attr.replace('answer', 'key'))
                        answer_str = ExamJSONParser.trim(item[attr])
                        question_matrix[question_id]['answers'][answer_key] = answer_str
        return question_matrix

    @classmethod
    def trim(cls, src_string):
        soup = BeautifulSoup(src_string, 'html.parser')
        new_string = soup.get_text()
        new_string = new_string.replace(u'\xa0', ' ').strip()
        return new_string


if __name__ == '__main__':
    parser = ExamJSONParser('TestData\Example Exam_onebyone.json')
    question_matrix = parser.get_questions()

    from common_helper import dict_to_str

    for title, options in question_matrix.iteritems():
        print title
        for option_key, option_value in options.iteritems():
            print '%s\n%s' % (option_key, dict_to_str(option_value))
        print
