# coding=utf-8
import sys

reload(sys)
sys.setdefaultencoding('utf8')
import bs4
from bs4 import BeautifulSoup
import re


class ExamHTMLParser(object):
    def __init__(self, exam_html_file_path):
        self.exam_html_file_path = exam_html_file_path

    def get_questions(self):
        question_matrix = {}
        with open(self.exam_html_file_path) as exam_html_file:
            soup = BeautifulSoup(exam_html_file, features='html.parser')
            questions_div = soup.find_all(attrs={'class': 'exam-question'})
            answers_div = soup.find_all(attrs={'class': 'answers'})
            for q, a in zip(questions_div, answers_div):
                question_title = ExamHTMLParser.trim(q.text)
                question_matrix[question_title] = {}
                for option_div in a.children:
                    if type(option_div) != bs4.element.Tag:
                        continue
                    input_ctrl = option_div.find(name='input')
                    option_span = option_div.find(attrs={'class': 'words'})
                    radio_key = ExamHTMLParser.trim(input_ctrl.attrs['data-name'])
                    radio_value = ExamHTMLParser.trim(option_span.text)
                    question_matrix[question_title][radio_key] = radio_value

        return question_matrix

    def get_questions_ids(self):
        questions_ids = []
        with open(self.exam_html_file_path) as exam_html_file:
            soup = BeautifulSoup(exam_html_file, features='html.parser')
            box_div = soup.find_all(class_=re.compile("iconBox questions_"))
            for box in box_div:
                questions_ids.append(box.attrs['questionsid'])
        return questions_ids

    @staticmethod
    def trim(string):
        return string.replace('\r', '').replace('\n', '').replace(' ', '')


if __name__ == '__main__':
    '''
    parser = ExamParser('TestData\Example Exam.html')
    question_matrix = parser.get_questions()
    for title, options in question_matrix.iteritems():
        print title
        for option_key, option_value in options.iteritems():
            print '%s\t%s' % (option_key, option_value)
    '''
    parser = ExamHTMLParser('TestData\Example Exam_onebyone.html')
    questions_ids = parser.get_questions_ids()
    for id in questions_ids:
        print id
