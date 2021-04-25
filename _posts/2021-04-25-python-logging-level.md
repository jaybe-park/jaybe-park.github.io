---
layout: post
title: Python - Logging Level
category: 'Python Advanced'
tag: [Python, Python Advanced, logging]
---

# Logging Level
파이썬은 기본적으로 5 단계의 로깅 레벨을 지원한다.

* DEBUG
  * 상세 정보
  * 주로 개발할 때 쓰이고, 실제 운영시에는 출력하지 않는다
  * 기본적으로 로깅은 모든 동작을 자세하게 출력하는 것이 좋다. 나중에 에러가 발생했을 때, 어디에서 문제가 발생했는지 파악하기 쉽기 때문이다.
* INFO
  * 정보성 로그
  * DEBUG보다는 중요하지만, 꼭 봐야 하는 로그는 아닐 때 출력하는 경우가 많다.
  * ex) DB Connection 정상 생성/종료, 데이터 로드 완료 등
* WARNING
  * 경고
  * 예상치 못한 일이 발생했을 때 or 가까운 미래에 발생할 문제에 대한 정보
  * ex) 디스크 부족이 예상 될 때 현재 사용중인 디스크 용량과 잔여 용량을 출력
* ERROR
  * 문제 발생
  * 프로그램이 일부 기능을 수행하지 못했을 때 관련된 정보를 출력
  * ex) 데이터베이스 문제로 일부 정보를 불러오지 못했을 때
* CRITICAL
  * 심각한 에러
  * 프로그램 자체가 실행이 멈추거나 비정상 종료했을 때 관련된 정보를 출력

## Level 별 주의사항
### WARNING 과 ERROR의 차이

WARNING은 문제에 대한 사전 경고의 의미로 쓰여야 한다. 따라서, WARNING이 발생해도 프로그램을 정상적으로 동작해야 한다. 하지만 ERROR는 프로그램의 기능 중에 일부가 동작하지 않거나 실패했을 때 쓰여야 한다.

ex) DB Connection이 몇개 남지 않았음 → WARNING  
ex) DB Connection이 모두 사용중이라 데이터를 불러올 수 없음 → ERROR

### ERROR와 CRITICAL의 차이

ERROR와 CRITICAL은 모두 프로그램의 동작 실패를 나타내는데 쓰인다. 하지만, ERROR는 (일부) 기능의 실패에 쓰인다. 반면에 CRITICAL은 더욱 심각한 에러, 예를 들면 프로그램 전체가 동작하지 않게 될 때 쓰인다. 따라서, 같은 에러라도 ERROR로 처리되야 할 경우가 있고, CRITICAL으로 처리되야 할 경우가 있다. 예를 들어,

ex) DB Connection이 모두 사용중이라 회원 정보를 불러올 수 없으나 그래도 서비스를 이용할 순 있음 → ERROR  
ex) DB Connection이 모두 사용중이라 메타 정보(버전 정보, 시간대 등)를 불러올 수 없어 프로그램이 정지 → CRITICAL

---

## Log Level의 실제 값

다른 언어에 대한 경험이 많다면, 또는 logging 모듈을 많이 써보신 분들이라면 짐작하고 계시겠지만, Log Level은 이미 정해진 값이다.

| Level    | Value |
| :------- | :---- |
| CRITICAL | 50    |
| ERROR    | 40    |
| WARNING  | 30    |
| INFO     | 20    |
| DEBUG    | 10    |
| NOTSET   | 0     |
| CRITICAL | 50    |

실제로 확인해보고 싶으신 분들은 python 에서 간단하게 확인할 수 있다.

```python
>>> import logging
>>> print(logging.CRITICAL)
50
>>> print(logging.ERROR)
40
>>> print(logging.WARNING)
30
>>> print(logging.INFO)
20
>>> print(logging.DEBUG)
10
>>> print(logging.NOTSET)
0
```

로그 레벨을 설정하는 것은 출력될 로그의 로그레벨 최소값을 설정하는 것과 같다. 예를 들어, 기본적으로 logging 모듈을 import 했을 때는 로그 레벨이 WARNING으로 설정되어 있기 때문에 warning 아래의 로그 함수를 실행하면 화면에 나타나지 않는다.

```python
>>> import logging
>>> logging.debug('debug msg')           # 나타나지 않음
>>> logging.info('info msg')             # 나타나지 않음
>>> logging.warning('warning msg')
WARNING:root:warning msg
>>> logging.error('error msg')
ERROR:root:error msg
>>> logging.critical('critical msg')
CRITICAL:root:critical msg
```

위의 출력된 로그를 살펴보면, 로그 레벨과 메세지말고도 `root`라는 문구가 같이 출력되는 것을 알 수 있다. 이 문구는 나중에 살펴볼 logger의 이름이니 지금은 신경쓰지 않고 넘어가도 된다.

logging 모듈에는 편의성을 위해 제공되는 위 5개의 함수 말고, 로그레벨을 지정하여 로그를 발생시키는 log라는 함수가 존재한다. 이 함수를 이용하여 위와 같은 결과를 얻고 싶으면 다음과 같이 실행하면 된다.

```python
>>> logging.log(10, 'debug msg')         # 나타나지 않음
>>> logging.log(20, 'info msg')          # 나타나지 않음
>>> logging.log(30, 'warning msg')
WARNING:root:warning msg
>>> logging.log(40, 'error msg')
ERROR:root:error msg
>>> logging.log(50, 'critical msg')
CRITICAL:root:critical msg
```

따라서, 이렇게 생각할 수 있다.

```python
logging.debug('debug msg') == logging.log(10, 'debug msg')
logging.info('info msg') == logging.log(20, 'info msg')
logging.warning('warning msg') == logging.log(30, 'warning msg')
logging.error('error msg') == logging.log(40, 'error msg')
logging.critical('critical msg') == logging.log(50, 'critical msg')
```

## 사용자 정의 로그 레벨

그렇다면, 내가 로그 레벨을 정의해서 사용할 수는 없을까?

예를 들어 로그 레벨을 31을 사용하고 싶으면 다음과 같이 사용하면 된다.

```python
>>> logging.log(31, 'log level 31 msg')
Level 31:root:log level 31 msg
```

로그 레벨이 31이므로, Default로 정해진 로그레벨인 WARNING(값: 30) 이상이기 때문에 출력 결과를 볼 수 있다. 로그 레벨이 29인 메세지는 보이지 않는다.

```python
>>> logging.log(29, 'log level 29 msg')      # 나타나지 않음
```

그런데, "Level 31"로 나타나는 것은 뭔가 맘에 들지 않는다. 따라서 WARNING보다 조금 높은 로그 레벨이라는 의미로 로그 레벨 31에 "WARNING+"라는 이름을 붙이고 싶다. 이 경우에는 아래와 같이 사용하면 가능하다.

```python
>>> logging.addLevelName(31, 'WARNING+')
>>> logging.log(31, 'Level 31 msg')
WARNING+:root:Level 31 msg
```

하지만, 파이썬 공식 docs에는 사용자 정의 로깅 레벨을 정의하는 것을 추천하지 않는다. (거의 하지말라는 느낌) 많은 실무 경험을 토대로 파이썬 개발자들이 정의한 수준이므로, 5가지의 기본 레벨만으로 충분하다고 한다.

> 특히, 라이브러리를 개발하고 있다면, ***사용자 지정 수준을 정의하는 것은 매우 나쁜 생각*** 일수 있다고 한다.

사용자가 정의한 로깅 수준은 여러 라이브러리와 (당연하겠지만) 협의되지 않은 것이기 때문에 다른 라이브러리 및 사용자가 로깅 결과를 제어/해석하는 것이 어려울 수 있기 때문이다.
