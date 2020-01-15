# coding=utf-8


import re
import string
from zhon.hanzi import punctuation


def dict_to_str(src_dict):
    if isinstance(src_dict, dict):
        return '\n'.join(["%s = %s" % (k, v) for k, v in src_dict.items()])
    else:
        return str(src_dict)


class StringMatcher(object):
    def __init__(self, tolerance):
        self.__cache = {}
        self.tolerance = tolerance

    def match(self, string1, string2):
        if not string1 in self.__cache:
            self.__cache[string1] = MatchObject(string1)
        if not string2 in self.__cache:
            self.__cache[string2] = MatchObject(string2)

        str1_no_pun = self.__cache[string1].no_punctuation_string
        str2_no_pun = self.__cache[string2].no_punctuation_string
        if str1_no_pun == str2_no_pun:
            return True
        elif str1_no_pun in str2_no_pun or str2_no_pun in str1_no_pun:
            len_diff = abs(len(str1_no_pun) - len(str1_no_pun))
            if len_diff <= self.tolerance and len_diff < len(str1_no_pun) and len_diff < len(str2_no_pun):
                return True
            else:
                return False
        else:
            return False


class MatchObject(object):
    def __init__(self, src_string):
        self.no_punctuation_string = re.sub(ur'[%s%s ]+' % (string.punctuation, punctuation), '', src_string)


if __name__ == '__main__':
    matchObj = MatchObject(u'1+2-3/4@com!《测试》。（测试）！')
    print matchObj.no_punctuation_string
