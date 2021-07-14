import editor from '@easylogic/editor';
import '@easylogic/editor/dist/editor.css';
import yorkie from 'yorkie-js-sdk';




let yorkieClient = null;
let yorkieDocument = null;

async function createYorkie(editor) {
    try {
        // 01. create client with RPCAddr(envoy) then activate it.
        yorkieClient = yorkie.createClient('https://localhost:8080');
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

                // 여긴 받은 change 를 업데이트를 해야하는데 
                const remoteDoc = JSON.parse(yorkieDocument.toJSON());

                // console.log(JSON.parse(JSON.stringify(remoteDoc)));

                editor.emit('load.json', remoteDoc.projects);

                setTimeout(() => {
                    // console.log(editor.selection.currentProject.indexed);
                    editor.nextTick(() => {
                        // console.log(...editor.selection.itemsByIds(editor.selection.ids));
    
                        editor.selection.select(...editor.selection.itemsByIds(editor.selection.ids));
    
                            // editor.emit('refreshAll');
                            // editor.emit('refreshSelectionTool');
                            // editor.emit('refreshStyleView');


                            // console.log(editor.selection.currentProject.indexed);
    
                    })
                }, 500);

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
                // console.log('a');
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