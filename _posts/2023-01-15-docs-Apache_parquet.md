---
layout: post
title: 1. Apache Parquet
category: Docs
tag: [Docs, Apache Parquet]
---

해당 글은 [Apache Parquet 공식 Docs](https://parquet.apache.org/docs/)와 [parquet-foramt의 README.md](https://github.com/apache/parquet-format#readme)를 번역한 내용입니다.  

* 시점에 따라 위 링크의 내용은 변경되었을 수 있습니다.
  * 시작일: 2023-01-15
  * 완료일: TDB
* 제 짧은 지식과 영어 실력으로 의역 및 오역이 있을 수 있습니다.
* 위 두 링크 중에 [parquet-foramt의 README.md](https://github.com/apache/parquet-format#readme)가 내용이 더 최신인 것으로 예상됩니다. 원분을 참고하실 분들은 여기를 참고하세요
* 아직 번역이 완성되지 않았습니다. 업로드 일정은 미정입니다...

---

# Overview

> 아파치 파케이에 대한 모든 것

아파치 파케이(이하 파케이)는 하둡 생태계의 모든 프로젝트에서 사용할 수 있는 열(column) 기반 저장 방식이며, 어떠한 데이터 처리 프레임워크, 데이터 모델이나 프로그래밍 언어에서도 사용할 수 있다.

## 동기

파케이는 하둡 생태계의 모든 프로젝트에서 압축된, 효율적인 열 기반 데이터 표기를 이용할 수 있게 하기 위해 개발되었다.

파케이는 처음부터 복잡한 중첩 데이터 구조를 염두에 두고 구축되었으며, [Dremel Paper](https://research.google/pubs/pub36632/)에서 제시된 중첩된 데이터의 분해 및 조립 [알고리즘](https://github.com/julienledem/redelm/wiki/The-striping-and-assembly-algorithms-from-the-Dremel-paper)을 사용하였다. 우리는 이 방식이 중첩된 데이터 구조를 단순히 평면화(flatten)하는 것보다 더 우수하다고 생각한다.

많은 프로젝트에서 데이터의 올바른 압축 및 인코딩 방식이 성능에 미치는 영향을 확인할 수 있다. 파케이는 매우 효율적인 데이터 압축 및 인코딩 방식을 지원하도록 제작되었다. 파케이는 컬럼 레벨에서 데이터를 압축하는 것에 특화되어 있으며, 인코딩이 새롭게 발명되고 구현되는 것에 대처할 수 있도록 만들어져 있다.

파케이는 누구나 사용할 수 있도록 제작되었다. 하둡 생태계에는 많은 데이터 처리 프레임 워크가 있으며, 우리는 그 중 일부만 지원하는 것에는 관심이 없었다. 우리는 효율적이고 잘 구현된 열 기반 저장이 광범위하고 종속성을 설정하기 어려운 문제 없이 모든 프레임워크에 유용할 것이라 생각한다.

---

# 컨셉

> 용어 사전

* 블록 (hdfs block)
  * hdfs에서의 블록과 의미가 동일하며, 변경되지 않았다.
  * 파케이의 파일 시스템은 hdfs에서도 잘 동작하게 구현되었다.
* 파일 (File)
  * hdfs의 파일이며, 파일에 대한 메타데이터를 반드시 포함하여야 한다.
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

# 파일 포멧

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

위 예시에서 이 테이블은 N개의 열로 이루어져 있고, 각각은 M개의 행 그룹으로 이루어져 있다. 파일 메타데이터는 모든 컬럼 메타데이터가 어디에서 시작되는지에 대한 정보를 포함하고 있다. 메타데이터에 어떤 것들이 포함되는지는 위의 Thrift 정의를 참고하면 알 수 있다.

메타 데이터는 한번의 데이터 기록을 위해 데이터 이후에 쓰여진다.

파케이를 읽는 사람 또는 프로그램은 그들이 찾는 데이터가 어디있는지 알기 위해서 파일 메타데이터를 처음 읽는 것을 가정하고 만들어졌다. 컬럼 청크들은 파일 메타데이터를 읽은 후에 읽어야 한다.

![parquet-file_format](https://camo.githubusercontent.com/e034316c88a806342315126d6b22f90cd88cdf810cb44c7725f63725e9037f96/68747470733a2f2f7261772e6769746875622e636f6d2f6170616368652f706172717565742d666f726d61742f6d61737465722f646f632f696d616765732f46696c654c61796f75742e676966)  

## 메타데이터






## 설정

* 행 그룹 사이즈
  * 행 그룹이 클수록 큰 선형적 IO가 가능하다. 하지만, 행 그룹이 클수록 기록하는데 더 큰 버퍼링이 필요하다.
  * 우리는 행 그룹을 크게 할 것을 추천한다. (512MB - 1GB) 모든 행 그룹을 읽어야 할 때, 이 그룹이 하나의 HDFS 블록에 맞춰지길 원하기 때문이다. 따라서, HDFS 블록 사이즈 또한 커져야 한다.
  * 최적의 설정은 1GB의 행 그룹, 1GB의 HDFS 블록 사이즈, 1 HDFS 블록 당 하나의 HDFS 파일이다.

* 데이터 페이지 사이즈
  * 페이지는 단일 행 조회와 같은 세밀한 데이터 접근을 허용할 수 있도록 충분히 작아야 합니다. 하지만, 큰 페이지 사이즈는 공간(*역자 주: 페이지가 클수록 헤더의 갯수는 적어지니까*) 및 파싱(*역자 주: 헤더가 적을수록 파싱 작업이 덜 필요하니까*) 오버헤드가 적어진다. (주의: 선형적 스캔은 페이지를 한번에 한개씩 조회하는 것을 뜻하지 않는다.)
  * 우리는 페이지 당 8KB를 추천한다.


## Extensibility
## Types
### Logical Types
## Nested Encoding
## Data Pages
### Encodings
### Checksumming
### Column Chunks
### Error Recovery
## Nulls