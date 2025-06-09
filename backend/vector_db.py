import os
import pickle
import faiss
import numpy as np
import ollama

class Memory:
    """
    A class to handle memory storage and retrieval for an LLM using Faiss and Ollama for embeddings.
    """

    def __init__(self, use_gpu=False):
        """
        Initialize the Memory class with Faiss configuration.
        
        Args:
            use_gpu (bool): Whether to use GPU acceleration if available.
        """
        self.use_gpu = use_gpu
        self.dimension = None  # Embedding dimension will be set after the first embedding
        self.index = None
        self.vector_ids = []
        self.metadata = {}
        self._build_index()

    def _build_index(self):
        """
        Initialize and build the Faiss index.
        """
        try:
            if self.use_gpu and faiss.get_num_gpus() > 0:
                print("Using GPU version of Faiss...")
                index_flat = faiss.IndexFlatL2(0)  # Dimension will be set later
                res = faiss.StandardGpuResources()  # type: ignore # Use a single GPU
                index_flat = faiss.index_cpu_to_gpu(res, 0, index_flat) # type: ignore
                self.index = faiss.IndexIDMap(index_flat)
            else:
                print("Using CPU version of Faiss...")
                index_flat = faiss.IndexFlatL2(0)  # Dimension will be set later
                self.index = faiss.IndexIDMap(index_flat)
        except Exception as e:
            print(f"Error initializing Faiss index: {e}")
            raise

    def get_embedding(self, text, model="all-minilm:latest"):
        """
        Generate an embedding for the given text using Ollama's embed function.
        
        Args:
            text (str): The text to generate an embedding for.
        
        Returns:
            np.ndarray: The embedding vector.
        """
        try:
            # Prepare the ollama command
            #command = ['ollama', 'embed', '--json', text]

            # Call the command using subprocess
            #result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

            #if result.returncode != 0:
            #    print(f"Ollama error: {result.stderr}")
            #    raise Exception("Failed to generate embedding using Ollama.")

            # Parse the JSON output
            #output = result.stdout.strip()
            #embedding_data = json.loads(output)

            # Get the embedding vector
            embedding = ollama.embed(model, text).embeddings[0] #embedding_data.get('embedding')
            if embedding is None:
                raise Exception("Embedding not found in Ollama's output.")

            # Convert the embedding to a NumPy array
            embedding_vector = np.array(embedding, dtype=np.float32)

            # Set the dimension if not already set
            if self.dimension is None:
                self.dimension = len(embedding_vector)
                # Update the Faiss index with the correct dimension
                self._update_index_dimension()

            return embedding_vector
        except Exception as e:
            print(f"Error generating embedding: {e}")
            raise

    def _update_index_dimension(self):
        """
        Update the Faiss index with the correct embedding dimension after obtaining the first embedding.
        """
        try:
            if self.use_gpu and faiss.get_num_gpus() > 0:
                index_flat = faiss.IndexFlatL2(self.dimension)
                res = faiss.StandardGpuResources() # type: ignore
                index_flat = faiss.index_cpu_to_gpu(res, 0, index_flat) # type: ignore
                self.index = faiss.IndexIDMap(index_flat)
            else:
                index_flat = faiss.IndexFlatL2(self.dimension)
                self.index = faiss.IndexIDMap(index_flat)

            print(f"Faiss index updated with dimension: {self.dimension}")
        except Exception as e:
            print(f"Error updating Faiss index dimension: {e}")
            raise

    def add_memory(self, content: str, metadata: dict = None, vector_id: str = None): # type: ignore
        """
        Add text content with optional metadata to Faiss after generating its embedding.

        Args:
            content (str): The text content to add to the index.
            metadata (dict, optional): Metadata associated with the content.
            vector_id (str, optional): Custom ID for the vector.
        """
        try:
            # Generate embedding for the content using Ollama
            vector = self.get_embedding(content)

            # Generate a unique ID if not provided
            if not vector_id:
                vector_id = f"vector_{len(self.vector_ids) + 1}"

            # Use integer IDs for Faiss
            faiss_id = len(self.vector_ids)

            # Add the vector to the index with its integer ID
            self.index.add_with_ids(np.array([vector], dtype=np.float32), np.array([faiss_id], dtype=np.int64)) # type: ignore

            # Store the mapping from faiss_id to vector_id
            self.vector_ids.append(vector_id)
            if metadata is not None:
                self.metadata[vector_id] = metadata
            else:
                self.metadata[vector_id] = {'content': content}

            return vector_id
        except Exception as e:
            print(f"Error adding vector to Faiss: {e}")
            raise

    def search_memory(self, query: str, k: int = 1):
        """
        Search for similar contents in Faiss based on a query text.

        Args:
            query (str): The query text to search with.
            k (int, optional): Number of similar contents to retrieve.

        Returns:
            list: A list of dicts containing 'id', 'distance', and 'metadata' of the most similar contents.
        """
        try:
            if self.dimension is None or self.index.ntotal == 0: # type: ignore
                print("Index is empty or not initialized.")
                return []

            # Generate embedding for the query using Ollama
            query_vector = self.get_embedding(query)

            # Search for the k most similar vectors
            distances, indices = self.index.search(np.array([query_vector], dtype=np.float32), k) # type: ignore

            # Prepare results
            results = []
            for i in range(len(indices[0])):
                faiss_idx = indices[0][i]
                distance = distances[0][i]
                if faiss_idx != -1 and faiss_idx < len(self.vector_ids):
                    vector_id = self.vector_ids[faiss_idx]
                    result = {
                        "id": vector_id,
                        "distance": distance,
                        "metadata": self.metadata.get(vector_id, {})
                    }
                    results.append(result)

            return results
        except Exception as e:
            print(f"Error searching Faiss index: {e}")
            raise

    def update_memory(self, vector_id: str, new_content: str):
        """
        Update an existing content in Faiss by its ID.

        Args:
            vector_id (str): ID of the content to update.
            new_content (str): New content to replace the existing one.
        """
        try:
            # Find the index of the vector to update
            if vector_id not in self.vector_ids:
                raise ValueError(f"Vector ID '{vector_id}' not found.")
            faiss_id = self.vector_ids.index(vector_id)

            # Remove the old vector
            self.index.remove_ids(np.array([faiss_id], dtype=np.int64)) # type: ignore

            # Generate embedding for the new content using Ollama
            new_vector = self.get_embedding(new_content)

            # Add the new vector with the same Faiss ID
            self.index.add_with_ids(np.array([new_vector], dtype=np.float32), np.array([faiss_id], dtype=np.int64)) # type: ignore

            # Update metadata
            self.metadata[vector_id] = {'content': new_content}

            print(f"Content with ID '{vector_id}' updated successfully.")
        except Exception as e:
            print(f"Error updating vector in Faiss: {e}")
            raise

    def save_to_disk(
            self, 
            index_filepath=os.path.join(os.path.dirname(__file__), "faiss_db/faiss_index.bin"), 
            metadata_filepath=os.path.join(os.path.dirname(__file__), "faiss_db/metadata.pkl")
        ):
        """
        Save the index and metadata to disk.

        Args:
            index_filepath (str): Filepath to save the Faiss index.
            metadata_filepath (str): Filepath to save the metadata and vector IDs.
        """
        try:
            # Save the Faiss index
            faiss.write_index(self.index, index_filepath)
            print(f"Faiss index saved to {index_filepath}")

            # Save metadata and vector IDs
            data = {
                'vector_ids': self.vector_ids,
                'metadata': self.metadata,
                'dimension': self.dimension
            }
            with open(metadata_filepath, 'wb') as f:
                pickle.dump(data, f)
            print(f"Metadata saved to {metadata_filepath}")

        except Exception as e:
            print(f"Error saving to disk: {e}")
            raise

    def load_from_disk(
            self, 
            index_filepath = os.path.join(os.path.dirname(__file__), "faiss_db/faiss_index.bin"),
            metadata_filepath = os.path.join(os.path.dirname(__file__), "faiss_db/metadata.pkl")
    ):
        """
        Load the index and metadata from disk.

        Args:
            index_filepath (str): Filepath to load the Faiss index from.
            metadata_filepath (str): Filepath to load the metadata and vector IDs from.
        """
        try:
            # Load the Faiss index
            self.index = faiss.read_index(index_filepath)
            print(f"Faiss index loaded from {index_filepath}")

            # Load metadata and vector IDs
            with open(metadata_filepath, 'rb') as f:
                data = pickle.load(f)
            self.vector_ids = data['vector_ids']
            self.metadata = data['metadata']
            self.dimension = data['dimension']

            # If use_gpu is True, transfer the index to GPU
            if self.use_gpu and faiss.get_num_gpus() > 0:
                res = faiss.StandardGpuResources() # type: ignore
                self.index = faiss.index_cpu_to_gpu(res, 0, self.index) # type: ignore
                print("Index transferred to GPU")

            print(f"Metadata loaded from {metadata_filepath}")
            print(f"Index has {self.index.ntotal} vectors")
        except Exception as e:
            print(f"Error loading from disk: {e}")
            raise

    def close(self):
        """
        Close the Faiss index and release resources.
        """
        try:
            if self.index:
                self.index.reset()
                self.vector_ids = []
                self.metadata = {}
                self.dimension = None
                print("Faiss index cleared.")
        except Exception as e:
            print(f"Error closing Faiss index: {e}")

if __name__ == "__main__":
    # Initialize Memory using Ollama for embeddings
    memory = Memory(use_gpu=False)

    # Add some sample contents 
    from mongo_db import *
    docs = [doc for doc in libraryDocsCollection.find()]
    vector_num = 1
    for _ in docs:
        memory.add_memory(_["doc_name"].split(" - ")[-1], metadata={"doc_url":_["doc_url"], "doc_name":_["doc_name"]})

    # Save the index and metadata to disk
    memory.save_to_disk()

    # Create a new Memory object and load from disk
    #new_memory = Memory(use_gpu=False)
    memory.load_from_disk()

    # Search for similar contents
    query = "Kwoyelo Judgment"
    search_results = memory.search_memory(query, k=3)
    print("\nSearch results:")
    for result in search_results:
        print(f"ID: {result['id']}, Distance: {result['distance']}, Metadata: {result['metadata']['doc_url']}")

    # Update a memory
    #new_content = "This is the updated content for the first example."
    #memory.update_memory(vector_id1, new_content)

    # Close the index
    memory.close()
    