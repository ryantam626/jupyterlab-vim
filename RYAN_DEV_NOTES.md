Assumes we already have node.



```bash
uv venv --seed
source .venv/bin/activate
python -m pip install -U "jupyterlab>=4.0.0,<5"

jlpm install
# if the above didn't work
YARN_ENABLE_IMMUTABLE_INSTALLS=false jlpm install



python -m pip install ".[test]"

jupyter labextension list
jupyter labextension list 2>&1 | grep -ie "@ryantam626/jupyterlab_vim.*OK"
python -m jupyterlab.browser_check

```
