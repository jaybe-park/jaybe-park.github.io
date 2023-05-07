---
layout: post
title: 2. Apache Avro
category: Docs
tag: [Docs, Apache avro, 에이브로, 아브로]
---

Docs 시리즈는 공식 Docs를 통해 기술을 올바르게 이해하는 시리즈 입니다.

* 원문
  * [Apache Avro 공식 Docs](https://avro.apache.org/docs/)
  * [Apache Avro 영문 Wiki](https://en.wikipedia.org/wiki/Apache_Avro)

아직 Docs 시리즈는 형식이나 구성이 완전하진 않습니다. 글의 시인성이 좀 떨어지는 것 같아 구성을 바꿀수도 있을 것 같습니다.  
피드백이나 의견 있으시면 언제든지 [연락](/about)주세요.

---

![apache-avro-logo](/assets/Apache_Avro_Logo.png)

# Apache Avro

아파치 아브로(이하 아브로)는 아파치 하둡 프로젝트에서 시작된 데이터 직렬화 프레임워크입니다.

> 한국에서는 주로 에이브로라고 부르지만, 외국에서는 아브로라고 많이 부른다고 합니다. 원어 발음을 존중하는 의미에서 여기에서는 아브로라고 하겠습니다.

아브로의 정의에 많이 쓰이지만 정확한 의미를 잘 모르는 "직렬화"라는 단어가 나옵니다. 아래 글을 정확히 이해하기 위해서 직렬화라는 단어를 알아보고 가는게 좋을 것 같습니다.

## 직렬화 (Serialization)

직렬화란 <u>데이터를 저장하거나 기기 간 통신을 위해서 정해진 형식으로 데이터를 변환하는 것</u>을 의미합니다.

직렬화는 두 가지 종류가 있습니다.

1. 텍스트 기반 직렬화
   * 사람이 이해할 수 있는 텍스트를 기반으로 데이터를 나타내는 것
   * ex. `JSON`, `CSV`, `XML` 등
2. <u>바이너리 기반 직렬화</u>
   * 컴퓨터가 쉽게 처리할 수 있도록 이진수를 이용하여 데이터를 나타내는 것
   * ex. `pickle`, `parquet`, `avro` 등

하지만 주로 데이터 직렬화라고 한다면, 두 번째인 바이너리 기반 직렬화를 의미합니다. 최종적으로는 데이터가 저장되고 처리되려면 바이너리로 저장되야 하기 때문입니다. 이후 글에서도 직렬화는 바이너리 기반 직렬화를 뜻한다고 이해하시면 됩니다.

### 인코딩 (Encoding) 과의 차이

인코딩은 더 넓은 의미를 가지고 있습니다.

인코딩은 압력된 데이터를 다른 형식으로 바꾸는 것 자체를 의미합니다. 예를 들어, `ASCII` 문자를 `utf-8`로 바꾸는 것 (문자 인코딩), `avi` 동영상을 `mp4`로 바꾸는 것 (동영상 인코딩) 등에 쓰일 수 있습니다.

> 인코딩 = 어떤 것의 형식을 변환하는 행위  
> 직렬화 = 데이터를 바이트 단위로 변환하는 행위

---

## 1. 스키마 (Schema)

아브로의 가장 큰 특징은 스키마가 존재한다는 점입니다.

아브로의 스키마는 JSON 형식으로 정의됩니다. 간단한 예시는 아래와 같습니다.

```json
{
  "namespace": "example.avro",
  "type": "record",
  "name": "User",
  "fields": [
    {"name": "name", "type": "string"},
    {"name": "favorite_number",  "type": ["null", "int"]},
    {"name": "favorite_color", "type": ["null", "string"]}
  ] 
}
```

JSON 형식이라서 별다른 배경지식 없어도 아래와 같은 사실을 알 수 있습니다.

* namespace는 `example.avro`
* type은 `record`
* 이름은 `User`
* 필드는 `name`, `favorite_number`, `favorite_color`이며, name은 필수이고 나머지 두개는 nullable

여기에서 namespace, type 등은 비슷한 형식을 많이 접해보신 분들이라면 어렴풋이 예상하실 수도 있지만, 내부 데이터를 정의하는 방식들 입니다.  
이 글에서는 해당 디테일까지는 살펴보지 않으니 넘어가셔도 좋습니다.

---

## 2. 아브로 기반 파일

아브로는 데이터를 나타내는 형식이기 때문에 당연하게도 아브로를 이용하여 데이터를 파일로 저장할 수 있습니다. 정확한 내용은 [링크](https://avro.apache.org/docs/1.11.1/specification/#object-container-files)를 참조하시면 됩니다.

파일의 구조를 간략하게 살펴보면 아래와 같습니다.
1. 파일 헤더
   * 매직 넘버 : ASCII 문자로 ‘O’, ‘b’, ‘j’ + 버전을 나타내는 1을 바이트로 (0x4F 0x62 0x6A 0x01)
   * 메타 데이터
     * 스키마 : 위에서 설명
     * 코덱 : 데이터 블록을 압축하기 위해서 사용된 코덱. 자세한 내용은 [링크](https://avro.apache.org/docs/1.11.1/specification/#required-codecs) 참조
   * 싱크 마커 (sync marker) : 랜덤으로 생성된 16바이트.
2. 하나 이상의 데이터 블록(block)
   * 데이터 블록 갯수 (long 타입)
   * 데이터 블록 총 바이트수 (long 타입)
   * 직렬화 된 데이터 블록
   * 싱크 마커 (sync marker) : 랜덤으로 생성된 16바이트.

아래 예시를 보면 조금 더 쉬운 이해가 될 것 같습니다.

```python
import avro.schema
from avro.datafile import DataFileReader, DataFileWriter
from avro.io import DatumReader, DatumWriter

# Need to know the schema to write. According to 1.8.2 of Apache Avro
schema = avro.schema.parse(open("user.avsc", "rb").read())

writer = DataFileWriter(open("users.avro", "wb"), DatumWriter(), schema)
writer.append({"name": "Alyssa", "favorite_number": 256})
writer.append({"name": "Ben", "favorite_number": 8, "favorite_color": "red"})
writer.close()
```

여기에서 `user.avsc`는 위에서 살펴본 스키마 내용이며, 해당 내용을 아브로 형식에 따라 직렬화 한 스키마 파일입니다.

아래는 결과입니다. (글자 수 때문에 일부 바이트는 생략했으며, 정확한 바이트는 [Apache Avro 영문 Wiki](https://en.wikipedia.org/wiki/Apache_Avro) 참조)  

```
$ od -v -t x1z users.avro 
0000000 4f 62 .. 65 63  >Obj...avro.codec<
0000020 08 6e .. 65 6d  >.null.avro.schem<
0000040 61 ba .. 65 63  >a..{"type": "rec<
0000060 6f 72 .. 22 55  >ord", "name": "U<
0000100 73 65 .. 63 65  >ser", "namespace<
0000120 22 3a .. 72 6f  >": "example.avro<
0000140 22 2c .. 7b 22  >", "fields": [{"<
0000160 74 79 .. 22 2c  >type": "string",<
0000200 20 22 .. 22 7d  > "name": "name"}<
0000220 2c 20 .. 6e 74  >, {"type": ["int<
0000240 22 2c .. 61 6d  >", "null"], "nam<
0000260 65 22 .. 6e 75  >e": "favorite_nu<
0000300 6d 62 .. 22 3a  >mber"}, {"type":<
0000320 20 5b .. 75 6c  > ["string", "nul<
0000340 6c 22 .. 66 61  >l"], "name": "fa<
0000360 76 6f .. 5d 7d  >vorite_color"}]}<
0000400 00 05 .. 42 ef  >......GTb.h...B.<
0000420 24 04 .. 06 42  >$.,.Alyssa.....B<
0000440 65 6e .. 47 54  >en....red.....GT<
0000460 62 bf .. ef 24  >b.h...B.$<
0000471
```

잘 살펴보면 위에서 말했던 매직넘버, 코덱, 스키마, 데이터 등을 발견할 수 있습니다.

---

사실 원래 쓰고 싶었던 이유는 카프카의 Serializer로써의 아브로 형식을 쓰고 싶었는데 아직 내가 준비되지 않은 것 같아서 여기까지 쓰려고 한다. 카프카에 대해서 잘 모르긴 해서...

앞으로는 카프카에 대해서 쓰려고 하는데 솔직히 걱정은 많이 된다. 워낙에 방대한 주제고 잘 아시는 분들이 많아 내가 잘 쓸 수 있을지 모르겠다.
