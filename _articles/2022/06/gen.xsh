art="""2022-06-05-april-showers-may-flowers.png
    2022-06-05-frog-weather.jpeg
        2022-06-05-growth.png
            2022-06-05-normal-clouds.gif
                2022-06-05-puddle-fish.png
                    2022-06-05-waste-of-a-break.png"""


for l in art.split('\n'):
    l=l.strip()
    cool="""---
layout: article
title: "xxxxxxxxxx"
image: /assets/img/2022/06/"""+l+"""
order:
---

{% include image.html image=page.image %}"""

    with open(l.split('.')[0]+'.md','w') as ff:
        print(cool,file=ff)
