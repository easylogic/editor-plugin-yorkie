# editor-plugin-yorkie
yorkie extension for easylogic studio 

# What I need 

Yorkie 모델 기반의 Layer Model 이 따로 존재햐야함 

지금은 Item 기준으로 JSON 형태의 데이타를 다루도록 되어 있는데 

이걸 Yorkie 의 Root 로 변경해야함 

예를 들어 Project 를 생성하는 시점에 yorkie document 를 생성하고 root 를 연결함. 

이후 appendChild 나 기타 하위 요소가 추가 되면  Layer 를 생성하고 Layer 에 맞는 모델을 Yorkie 데이타로 넣을 수 있도록 구조를 맞춰야할 수 있음. 

```js
editor.createItem({ itemType: 'project' }) 
```




# Concept 

```js
import editor from '@easylogic/editor';
import '@easylogic/editor/dist/editor.css';
import yorkie from 'yorkie-js-sdk';




let yorkieClient = null;
let yorkieDocument = null;

async function createYorkie(editor) {
    try {
        // 01. create client with RPCAddr(envoy) then activate it.
        yorkieClient = yorkie.createClient('https://api.yorkie.dev');
        await yorkieClient.activate();

        // 02. create a document then attach it into the client.
        yorkieDocument = yorkie.createDocument('easylogic.studio', 'webeditor');
        await yorkieClient.attach(yorkieDocument);

        yorkieDocument.update((root) => {
            if (!root.projects) {
                root['projects'] = []
            }
        }, 'init projects');
        yorkieDocument.subscribe((event) => {

            if (event.type === 'remote-change') {
                const remoteDoc = JSON.parse(yorkieDocument.toJSON());

                // todo 변경된 부분만 업데이트를 할 수 있나요? 
                editor.emit('load.json', remoteDoc.projects);
            }

        });
        await yorkieClient.sync();

    } catch (e) {
        console.error(e);
    }
}

async function syncToYorkie(editor) {

    const trySend = () => {
        if (yorkieDocument) {
            yorkieDocument.update((root) => {
                // todo 변경 지점만 보낼 수 있나요? 
                root.projects = JSON.parse(editor.makeResource(editor.projects))
            }, `update projects all items`);
        }
    }

    editor.on('refreshHistory', () => {
        console.log('refreshHistory');
        trySend()
    }, editor, 100);
    editor.on('setAttribute', () => {
        console.log('setAttribute');
        trySend()
    }, editor, 100);
    editor.on('refreshRect', () => {
        console.log('refreshRect');
        trySend()
    }, editor, 100);
    editor.on('setAttributeForMulti', () => {
        console.log('setAttributeForMulti');
        trySend()
    }, editor, 100);

}

editor.createDesignEditor({
    container: document.getElementById('app'),
    plugins: [
        async function (editor) {
            await createYorkie(editor);

            await syncToYorkie(editor);

            console.log(editor);
        }
    ]
})

```

# LICENSE : MIT 