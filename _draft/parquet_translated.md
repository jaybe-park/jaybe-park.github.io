---
# Docs

* 원문
  * [Apache Parquet 공식 Docs](https://parquet.apache.org/docs/)
    * Parquet에 대한 전반적인 내용 및 안내
  * [parquet-foramt의 README.md](https://github.com/apache/parquet-format#readme)
    * Parquet 파일의 포멧에 대한 프로젝트
  * 위 두 링크를 제가 임의로 내용을 합쳐서 번역하였으며, 이해에 도움이 될 방향으로 정리하였습니다.
* 시점에 따라 위 링크의 내용은 변경되었을 수 있습니다.
  * 번역 시작일: 2023-01-15
  * 번역 완료일: 2023-02-18
## Overview

> 아파치 파케이에 대한 모든 것

아파치 파케이(이하 파케이)는 하둡 생태계의 모든 프로젝트에서 사용할 수 있는 열(column) 기반 저장 방식이며, 어떠한 데이터 처리 프레임워크, 데이터 모델이나 프로그래밍 언어에서도 사용할 수 있다.
### 동기

파케이는 하둡 생태계의 모든 프로젝트에서 압축된, 효율적인 열 기반 데이터 표기를 이용할 수 있게 하기 위해 개발되었다.

파케이는 처음부터 복잡한 중첩 데이터 구조를 염두에 두고 구축되었으며, [Dremel Paper](https://research.google/pubs/pub36632/)에서 제시된 중첩된 데이터의 분해 및 조립 [알고리즘](https://github.com/julienledem/redelm/wiki/The-striping-and-assembly-algorithms-from-the-Dremel-paper)을 사용하였다. 우리는 이 방식이 중첩된 데이터 구조를 단순히 평면화(flatten)하는 것보다 더 우수하다고 생각한다.

많은 프로젝트에서 데이터의 올바른 압축 및 인코딩 방식이 성능에 미치는 영향을 확인할 수 있다. 파케이는 매우 효율적인 데이터 압축 및 인코딩 방식을 지원하도록 제작되었다. 파케이는 컬럼 레벨에서 데이터를 압축하는 것에 특화되어 있으며, 인코딩이 새롭게 발명되고 구현되는 것에 대처할 수 있도록 만들어져 있다.

파케이는 누구나 사용할 수 있도록 제작되었다. 하둡 생태계에는 많은 데이터 처리 프레임 워크가 있으며, 우리는 그 중 일부만 지원하는 것에는 관심이 없었다. 우리는 효율적이고 잘 구현된 열 기반 저장이 광범위하고 종속성을 설정하기 어려운 문제 없이 모든 프레임워크에 유용할 것이라 생각한다.

---

## 컨셉

> 용어 사전

* 블록 (hdfs block)
  * hdfs에서의 블록과 의미가 동일하며, 변경되지 않았다.
  * 파케이의 파일 시스템은 hdfs에서도 잘 동작하게 구현되었다.
* 파일 (File)
  * hdfs의 파일이며, 파일에 대한 메타 데이터를 반드시 포함하여야 한다.
  * 데이터를 꼭 포함하지 않아도 된다.
* 행 그룹 (Row group)
  * 데이터를 행으로 나눈 논리적 파티션
  * 실제로 보장되는 물리적 구조는 없으며, 컬럼별 청크로 이루어진다.
* 컬럼 청크 (Chunk)
  * 해당 컬럼에 대한 데이터 덩어리
  * 특정 행 그룹에 속하며, 파일 안에서는 인접함이 보장된다.
* 페이지 (Page)
  * 청크는 1개 이상의 페이지로 이루어져 있다.
  * 페이지는 이론적으로 (압축 및 인코딩의 입장에서) 나눌 수 없는 단위이다.
  * 청크에는 여러 개의 다른 타입으로 이루어진 페이지가 있을 수 있다.

계층적으로 보자면, 파일은 하나 또는 이상의 행 그룹으로 이루어진다. 행 그룹은 정확히 컬럼 별 하나의 청크로 이루어진다. 청크는 하나 또는 이상의 페이지로 이루어진다.

---

## 파일 포멧

> 파케이 파일 포멧에 대한 문서

파케이 파일 포멧은 아래의 예시와 [Thrift 정의](https://github.com/apache/parquet-format/blob/master/src/main/thrift/parquet.thrift)를 같이 봐야 이해할 수 있다.

```
4-byte magic number "PAR1"
<Column 1 Chunk 1 + Column Metadata>
<Column 2 Chunk 1 + Column Metadata>
...
<Column N Chunk 1 + Column Metadata>
<Column 1 Chunk 2 + Column Metadata>
<Column 2 Chunk 2 + Column Metadata>
...
<Column N Chunk 2 + Column Metadata>
...
<Column 1 Chunk M + Column Metadata>
<Column 2 Chunk M + Column Metadata>
...
<Column N Chunk M + Column Metadata>
File Metadata
4-byte length in bytes of file metadata
4-byte magic number "PAR1"
```

위 예시에서 이 테이블은 N개의 열로 이루어져 있고, 각각은 M개의 행 그룹으로 이루어져 있다. 파일 메타 데이터는 모든 컬럼 메타 데이터가 어디에서 시작되는지에 대한 정보를 포함하고 있다. 메타 데이터에 어떤 것들이 포함되는지는 위의 Thrift 정의를 참고하면 알 수 있다.

메타 데이터는 한번의 데이터 기록을 위해 데이터 이후에 쓰여진다.

파케이를 읽는 사람 또는 프로그램은 그들이 찾는 데이터가 어디있는지 알기 위해서 파일 메타 데이터를 처음 읽는 것을 가정하고 만들어졌다. 컬럼 청크들은 파일 메타 데이터를 읽은 후에 읽어야 한다.

이 형식은 데이터에서 메타 데이터를 분리하도록 명시적으로 설계되었다. 이를 통해 열을 여러 파일로 분할할 수 있을 뿐만 아니라 하나의 메타 데이터 파일이 여러 개의 파케이 파일을 참조할 수 있다.

![parquet-file_format](https://camo.githubusercontent.com/e034316c88a806342315126d6b22f90cd88cdf810cb44c7725f63725e9037f96/68747470733a2f2f7261772e6769746875622e636f6d2f6170616368652f706172717565742d666f726d61742f6d61737465722f646f632f696d616765732f46696c654c61796f75742e676966)  

### 메타 데이터

Parquet 메타 데이터는 Apache Thrift를 사용하여 인코딩된다.

메타 데이터에는 파일 메타 데이터, 열(청크) 메타 데이터, 페이지 헤더 메타 데이터의 세 가지 유형이 있다. 모든 쓰리프트 구조는 TCompactProtocol을 사용하여 직렬화된다.

![parquet-metadata-format](https://parquet.apache.org/images/FileFormat.gif)


### 타입

파일 형식에서 지원되는 유형은 가능한 한 최소화하도록 설계되었으며, 타입이 디스크 스토리지에 미치는 영향에 중점을 두고 설계되었다. 예를 들어 16비트 정수는 효율적인 인코딩을 통해 32비트 정수로 커버되므로 스토리지 형식에서 명시적으로 지원되지 않는다. 이렇게 하면 해당 형식에 대한 읽기 및 쓰기 구현의 복잡성이 줄어들기 때문이다.

유형은 다음과 같습니다:

* BOOLEAN: 1비트 부울
* INT32: 32비트 부호 있는 정수
* INT64: 64비트 부호 있는 정수
* INT96: 96비트 부호 있는 정수
* FLOAT: IEEE 32비트 부동 소수점 값
* DOUBLE: IEEE 64비트 부동 소수점 값
* BYTE_ARRAY: 임의의 긴 바이트 배열.

#### 논리 타입

논리 타입은 기본 타입을 해석하는 방법을 지정하여 파케이 포멧이 저장할 수 있는 타입을 확장하는 데 사용된다. 이렇게 하면 기본 유형 집합을 최소한으로 유지하고 파케이 포멧의 효율적인 인코딩을 재사용할 수 있다. 예를 들어 문자열은 UTF8 어노테이션의 바이트 배열(바이너리)로 저장된다. 이러한 어노테이션은 데이터를 추가로 디코딩하고 해석하는 방법을 정의한다. 어노테이션은 파일 메타 데이터의 LogicalType 필드로 저장되며 LogicalTypes.md에 문서화되어 있다.

#### 정렬 순서

파케이는 여러 수준(예: 열 청크, 열 인덱스 및 데이터 페이지)에서 최소/최대 통계를 저장한다.

유형 값에 대한 비교는 다음 규칙을 따른다:

1. 각 논리 유형에는 지정된 비교 순서가 있다. 열에 알 수 없는 논리 유형이 주석으로 지정된 경우 통계가 데이터 탐색에 사용되지 않을 수 있습니다. 논리 유형의 정렬 순서는 [LogicalTypes.md](https://github.com/apache/parquet-format/blob/master/LogicalTypes.md) 페이지에 문서화되어 있습니다.
2. 기본 유형의 경우 다음 규칙이 적용됩니다:
   1. BOOLEAN
      1. 거짓, 참
   2. INT32, INT64
      1. 부호 비교.
   3. FLOAT, DOUBLE
      1. NaN 및 부호화된 0을 특수 처리하는 부호화된 비교. 자세한 내용은 `ColumnOrder` 유니온의 [Thrift 정의](https://github.com/apache/parquet-format/blob/master/src/main/thrift/parquet.thrift)에 문서화되어 있습니다. *(역자 - 원문에는 요약된 정렬 순서가 있지만 생략합니다.)*
   4. BYTE_ARRAY 및 FIXED_LEN_BYTE_ARRAY
      1. 사전 부호 없는 바이트 단위 비교.

### 중첩 인코딩

중첩된 열을 인코딩하기 위해 Parquet은 정의 및 반복 레벨에 대해 Dremel 인코딩을 사용한다. 정의 레벨은 열에 얼마나 많은 옵션이 정의되었는지를 지정한다. 반복 레벨은 어느 필드가 반복되었는지, 어느 값이 반복되는지를 지정한다. 최대 정의 및 반복 수준은 스키마에서 계산할 수 있습니다(예를 들어, 얼마나 많이 중첩되었는지). 레벨은 열의 모든 값에 대해 정의되며, 앞의 정보를 통해 얼마나 많은 비트가 사용될 지 알 수 있다.

레벨에 대한 두 가지 인코딩이 지원되는데, BITPACKED와 RLE이다. RLE가 BITPACKED를 대체할 수 있어 이제 RLE가 사용된다.






### 설정

* 행 그룹 사이즈
  * 행 그룹이 클수록 큰 선형적 IO가 가능하다. 하지만, 행 그룹이 클수록 기록하는데 더 큰 버퍼링이 필요하다.
  * 우리는 행 그룹을 크게 할 것을 추천한다. (512MB - 1GB) 모든 행 그룹을 읽어야 할 때, 이 그룹이 하나의 HDFS 블록에 맞춰지길 원하기 때문이다. 따라서, HDFS 블록 사이즈 또한 커져야 한다.
  * 최적의 설정은 1GB의 행 그룹, 1GB의 HDFS 블록 사이즈, 1 HDFS 블록 당 하나의 HDFS 파일이다.

* 데이터 페이지 사이즈
  * 페이지는 단일 행 조회와 같은 세밀한 데이터 접근을 허용할 수 있도록 충분히 작아야 합니다. 하지만, 큰 페이지 사이즈는 공간(*역자 주: 페이지가 클수록 헤더의 갯수는 적어지니까*) 및 파싱(*역자 주: 헤더가 적을수록 파싱 작업이 덜 필요하니까*) 오버헤드가 적어진다. (주의: 선형적 스캔은 페이지를 한번에 한개씩 조회하는 것을 뜻하지 않는다.)
  * 우리는 페이지 당 8KB를 추천한다.


## Extensibility
### Logical Types
## Nested Encoding
## Data Pages
### Encodings
### Checksumming
### Column Chunks
### Error Recovery
## Nulls