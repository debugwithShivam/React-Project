import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import img from '../../../assets/images/data.jpg';
import api from '../../../services/api';
import { createPage } from '../../../store/todoSlice';

export default function CreatePageCard() {
  const dispatch = useDispatch();
  const isPageFormOpen = useSelector((state) => state.states.createPage);
  const queryClient = useQueryClient();
  const [pageName, setPageName] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [pageTags, setPageTags] = useState('');

  const mutation = useMutation({
    mutationFn: async (page) => {
      const response = await api.post('/createPage', page);
      return response.data.data;
    },
    onSuccess: () => {
      setPageName('');
      setPageDescription('');
      setPageTags('');
      dispatch(createPage());
      queryClient.invalidateQueries({ queryKey: ['pageData'] });
    },
  });

  const handleCreatePage = (event) => {
    event.preventDefault();
    const name = pageName.trim();
    const description = pageDescription.trim();

    if (!name || !description) {
      return;
    }

    mutation.mutate({
      pageName: name,
      pageDescription: description,
      pagetag: pageTags.split(',').map((tag) => tag.trim()).filter(Boolean),
      favourite: false,
      date: String(Date.now()),
    });
  };

  if (!isPageFormOpen) {
    return null;
  }

  return (
    <div className="create-page-wrapper">
      <div className="create-page-card-container">
        <div className="create-page-card">
          <div className="card-left">
            <img src={img} alt="" />
          </div>
          <div className="card-right">
            <div className="container-header">
              <h1>Create New Page</h1>
              <p>Build something powerful today</p>
              <form className="form-group" onSubmit={handleCreatePage}>
                <input
                  type="text"
                  value={pageName}
                  onChange={(event) => setPageName(event.target.value)}
                  placeholder="Page Title"
                  required
                />
                <input
                  type="text"
                  value={pageDescription}
                  onChange={(event) => setPageDescription(event.target.value)}
                  placeholder="Page Description"
                  required
                />
                <input
                  type="text"
                  value={pageTags}
                  onChange={(event) => setPageTags(event.target.value)}
                  placeholder="Page Tags (comma separated)"
                />
                {mutation.isError && (
                  <p role="alert">{mutation.error.message || 'Could not create page. Please try again.'}</p>
                )}
                <button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Creating…' : 'Create Page'}
                </button>
                <button type="submit" onClick={()=>dispatch(createPage())}>
                  Close
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
