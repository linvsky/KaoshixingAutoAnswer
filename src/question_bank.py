# coding=utf-8
import sys

reload(sys)
sys.setdefaultencoding('utf8')
from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.converter import PDFPageAggregator
from pdfminer.layout import LTTextBoxHorizontal, LAParams
from pdfminer.pdfpage import PDFTextExtractionNotAllowed
import os
import re
import simplejson
import codecs


class QuestionBank(dict):
    def __init__(self, ):
        pass

    @staticmethod
    def build(question_file_list):
        raise NotImplemented()


class IlluminaQuestionBank(QuestionBank):
    question_re = re.compile(
        u'(?P<question_id>\d+)\S?\s*(?P<question_title>.+)[\uff08\(]\s*(?P<answer_ids>[A-G\s\,]+)\s*[\uff09\)][\u3002\uff1f\.]?$',
        re.U)
    question_re1 = re.compile(
        u'(?P<question_id>\d+)\S?\s*(?P<question_title>.+)\s*[^\uff08\(](?P<answer_ids>[A-G\s]+)[\u3002\uff1f\.]?$',
        re.U)
    question_title_re = re.compile(
        u'(?P<question_id>\d+)\.\S?\s*(?P<question_title>.*)$',
        re.U)
    question_answer_re = re.compile(
        u'(?P<question_title>.*)[\uff08\(]\s*(?P<answer_ids>[\w\s\,]+)\s*[\uff09\)]$',
        re.U)
    answer_re = re.compile(
        u'(?P<answer_id>[A-G])\S*\s*(?P<answer_title>.+)',
        re.U)

    def __init__(self):
        super(IlluminaQuestionBank, self).__init__()

    def load_from_file(self, question_bank_file_path):
        with open(question_bank_file_path, mode='r') as question_bank_file:
            question_bank = simplejson.load(question_bank_file, encoding='utf-8')
            self.update(question_bank)

    def save_to_file(self, question_bank_file_path):
        with codecs.open(question_bank_file_path, 'w', encoding='utf-8') as question_bank_file:
            question_bank_file.write(
                simplejson.dumps(illumina_bank, ensure_ascii=False, sort_keys=False, indent=4 * ' '))

    @staticmethod
    def build(question_file_list):
        question_bank = IlluminaQuestionBank()
        for question_file in question_file_list:
            text_content = IlluminaQuestionBank.parse_question_file(question_file)

            folder, filename = os.path.split(question_file)
            filename = os.path.splitext(filename)[0]
            question_txt_file_path = os.path.join(folder, '%s.txt' % filename)
            with open(question_txt_file_path, mode='w+') as question_txt_file:
                question_txt_file.writelines(text_content)

            question_matrix, question_id_matrix = IlluminaQuestionBank.build_question_matrix(text_content)
            question_bank.update(question_matrix)
            IlluminaQuestionBank.print_questions(question_matrix, question_id_matrix)
        return question_bank

    @staticmethod
    def print_questions(question_matrix, question_id_matrix):
        sorted_questions = sorted(question_id_matrix.items(), key=lambda pair: pair[1])
        for item in sorted_questions:
            title = item[0]
            id = item[1]
            answer = question_matrix[title]
            print 'QUESTION %s: %s' % (id, title.decode())
            print '\t' + ' | '.join([sub_a.decode() for sub_a in answer])
        print 'Total questions=' + str(len(question_matrix)) + ' ids=' + str(len(question_id_matrix))

    @staticmethod
    def parse_question_file(question_file_path):
        text_content = []
        with open(question_file_path, 'rb') as question_file:
            parser = PDFParser(question_file)
            document = PDFDocument(parser)

            if not document.is_extractable:
                raise PDFTextExtractionNotAllowed
            else:
                rsrcmgr = PDFResourceManager()
                laparams = LAParams()
                device = PDFPageAggregator(rsrcmgr, laparams=laparams)
                interpreter = PDFPageInterpreter(rsrcmgr, device)

                for page in PDFPage.create_pages(document):
                    interpreter.process_page(page)
                    layout = device.get_result()
                    for x in layout:
                        if isinstance(x, LTTextBoxHorizontal):
                            line = x.get_text().decode().strip()
                            if line:
                                text_content.append(line + '\n')
        return text_content

    @staticmethod
    def build_question_matrix(text_content):
        question_id_matrix = {}
        question_matrix = IlluminaQuestionBank()
        current_question = ''
        current_question_id = ''
        current_answer_ids = []
        unfinished_question = ''
        unfinished_answer_id = ''
        for line in text_content:
            line = line.strip()
            q_match = IlluminaQuestionBank.question_re.match(line)
            if bool(q_match):
                current_question = q_match.group('question_title').strip()
                current_question_id = q_match.group('question_id')
                current_answer_ids = q_match.group('answer_ids')
                if not current_question in question_matrix:
                    question_matrix[current_question] = []
                    question_id_matrix[current_question] = int(q_match.group('question_id'))
                unfinished_question = ''
                unfinished_answer_id = ''
            else:
                a_match = IlluminaQuestionBank.answer_re.match(line)
                if bool(a_match):
                    if unfinished_question:
                        current_question = unfinished_question.strip()
                        current_answer_ids = ''
                        if not current_question in question_matrix:
                            question_matrix[current_question] = []
                            question_id_matrix[current_question] = int(current_question_id)
                        question_matrix[current_question].append('ANSWER NOT SPECIFIED')
                        unfinished_question = ''
                        continue

                    if a_match.group('answer_id') in current_answer_ids:
                        question_matrix[current_question].append(
                            a_match.group('answer_title'))
                else:
                    q_match = IlluminaQuestionBank.question_re1.match(line)
                    if bool(q_match):
                        current_question = q_match.group('question_title').strip()
                        current_question_id = q_match.group('question_id')
                        current_answer_ids = q_match.group('answer_ids')
                        if not current_question in question_matrix:
                            question_matrix[current_question] = []
                            question_id_matrix[current_question] = int(q_match.group('question_id'))
                        unfinished_question = ''
                        unfinished_answer_id = ''
                    else:
                        title_match = IlluminaQuestionBank.question_title_re.match(line)
                        answer_match = IlluminaQuestionBank.question_answer_re.match(line)
                        if bool(title_match):
                            unfinished_question = title_match.group('question_title')
                            current_question_id = title_match.group('question_id')
                            if not unfinished_question:
                                unfinished_question = ' '
                        elif unfinished_question and bool(answer_match):
                            current_question = unfinished_question + answer_match.group('question_title').strip()
                            current_answer_ids = answer_match.group('answer_ids')
                            if not current_question in question_matrix:
                                question_matrix[current_question] = []
                                question_id_matrix[current_question] = int(current_question_id)
                            unfinished_question = ''
                        elif len(line) <= 2 and line[0].isupper() and line[0].isalpha():
                            unfinished_answer_id = line[0]
                            if unfinished_question:
                                current_question = unfinished_question.strip()
                                current_answer_ids = ''
                                if not current_question in question_matrix:
                                    question_matrix[current_question] = []
                                    question_id_matrix[current_question] = int(current_question_id)
                                question_matrix[current_question].append('ANSWER NOT SPECIFIED')
                                unfinished_question = ''
                        elif unfinished_answer_id and unfinished_answer_id in current_answer_ids:
                            question_matrix[current_question].append(line)
                            unfinished_answer_id = ''
                        elif unfinished_question:
                            unfinished_question += line
        return question_matrix, question_id_matrix


if __name__ == '__main__':
    '''
    text_content = [
        u'217.  是否所有的客户都可以购买我们公司为各类物种定制的联盟芯片(Consortium Array) ？',
        u'（B）',
        u'B.  加入分子标签 UMI, 可检测低频突变',
        u'C.  进行共存突变丰度评估，动态监测进展',
        u'D.  以上都是',
    ]
    question_matrix, question_id_matrix = IlluminaQuestionBank.build_question_matrix(text_content)
    IlluminaQuestionBank.print_questions(question_matrix, question_id_matrix)
    '''
    illumina_bank = IlluminaQuestionBank.build([
        u'TestData\因美纳小百科--产品技术市场篇.pdf',
        u'TestData\因美纳小百科--商业运营知识篇.pdf',
    ])

    current_folder = os.path.split(os.path.realpath(__file__))[0]
    question_bank_file_path = os.path.join(current_folder, 'Resources', 'question_bank.json')
    illumina_bank.save_to_file(question_bank_file_path)
    illumina_bank.clear()
    illumina_bank.load_from_file(question_bank_file_path)
