from app.rag.retriever import COLLECTION_NAME, _collection_name


class _EmbeddingFunction:
    def __init__(self, dimension):
        self.dimension = dimension

    def __call__(self, input):
        return [[0.0] * self.dimension for _ in input]


def test_collection_name_includes_embedding_dimension():
    assert _collection_name(_EmbeddingFunction(256)) == f"{COLLECTION_NAME}_256d"
    assert _collection_name(_EmbeddingFunction(384)) == f"{COLLECTION_NAME}_384d"
